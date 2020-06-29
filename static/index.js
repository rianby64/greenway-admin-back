ymaps.ready(init);

async function init() {
    // Creating the map.
    const myMap = new ymaps.Map("map", {
        center: [53.9, 27.56],
        zoom: 10
    }, {
        searchControlProvider: 'yandex#search'
    });

    window.myMap = myMap;

    const routeAddBtn = document.querySelector('#route-add');
    const routesList = document.querySelector('#routes-list');
    const routeInput = document.querySelector('#route-input');
    const routeSelectedLabel = document.querySelector('#route-selected-title');
    const routeEditBtn = document.querySelector('#route-edit');
    const routeForm = document.querySelector('#route-edit-form');
    const routeEditPathBtn = document.querySelector('#route-edit-path');
    const routeEditPathFinishBtn = document.querySelector('#route-edit-path-finish');
    const routeEditPathCancelBtn = document.querySelector('#route-edit-path-cancel');
    const routes = await fetch('/api/routes').then(routes => routes.json());

    function populateRoutesInDataList() {
        routesList.innerHTML = '';
        routes.forEach(route => {
            const option = document.createElement('option');
            option.label = route.title;
            option.value = route.id;
            routesList.appendChild(option);
        });
    }
    populateRoutesInDataList();

    let listener1 = null;
    let listener2 = null;
    let listener3 = null;

    routeInput.addEventListener('change', (e) => {
        const id = e.target.value;
        const route = routes.find(route => route.id === id);

        routeEditPathFinishBtn.hidden = true;
        routeEditBtn.hidden = true;
        routeEditPathBtn.hidden = true;
        routeEditPathCancelBtn.hidden = true;
        routeSelectedLabel.textContent = '-';

        if (!route) {
            return;
        }

        const inputs = {
            id: routeForm.querySelector('[name=id]'),
            animals: routeForm.querySelector('[name=animals]'),
            approved: routeForm.querySelector('[name=approved]'),
            children: routeForm.querySelector('[name=children]'),
            disabilities: routeForm.querySelector('[name=disabilities]'),
            minutes: routeForm.querySelector('[name=minutes]'),
            title: routeForm.querySelector('[name=title]'),
            description: routeForm.querySelector('[name=description]')
        }

        inputs.id.value = route.id;
        inputs.animals.checked = route.animals;
        inputs.approved.checked = route.approved;
        inputs.children.checked = route.children;
        inputs.disabilities.checked = route.disabilities;
        inputs.minutes.value = route.minutes;
        inputs.title.value = route.title;
        inputs.description.value = route.description;

        myMap.geoObjects.removeAll();
        listener1 && routeEditPathBtn.removeEventListener('click', listener1);
        listener2 && routeEditPathFinishBtn.removeEventListener('click', listener2);
        listener3 && routeEditPathCancelBtn.removeEventListener('click', listener3);
        routeEditPathBtn.hidden = false;
        routeEditBtn.hidden = false;
        routeSelectedLabel.textContent = route.title;

        // Creating a polyline.
        const myPolyline = new ymaps.Polyline(
            // Specifying the coordinates of the vertices.
            route.lines.map(line => [line.latitude, line.longitude]),
            {}, {
            strokeColor: "#00000088",
            // The line width.
            strokeWidth: 4,
            // The maximum number of vertices in the polyline.
            // Adding a new item to the context menu that allows deleting the polyline.
            editorMenuManager: function (items) {
                items.push({
                    title: "Delete line",
                    onClick: function () {
                        myMap.geoObjects.remove(myPolyline);
                    }
                });
                return items;
            }
        });

        myMap.geoObjects.add(myPolyline);

        myPolyline.events.add(['editorstatechange'], e => {
            const coords = e.originalEvent.target.geometry.getCoordinates();
            route.lines = coords.map(coord => {
                return {
                    latitude: coord[0],
                    longitude: coord[1],
                };
            });
        });

        listener1 = e => {
            myPolyline.editor.startEditing();
            routeEditPathBtn.hidden = true;
            routeEditBtn.hidden = true;
            routeEditPathFinishBtn.hidden = false;
            routeEditPathCancelBtn.hidden = false;
        };
        listener2 = e => {
            listener3(e);
            fetch(`/api/routes/${route.id}/lines`, {
                method: 'put',
                body: JSON.stringify(route.lines),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        };
        listener3 = e => {
            myPolyline.editor.stopEditing();
            routeEditPathBtn.hidden = false;
            routeEditBtn.hidden = false;
            routeEditPathFinishBtn.hidden = true;
            routeEditPathCancelBtn.hidden = true;
        }
        routeEditPathBtn.addEventListener('click', listener1);
        routeEditPathFinishBtn.addEventListener('click', listener2);
        routeEditPathCancelBtn.addEventListener('click', listener3);
    });

    const editRouteModal = document.getElementById("route-edit-modal");

    // Get the <span> element that closes the modal
    const editRouteModalClose = document.getElementById("route-edit-modal-close");

    routeEditBtn.addEventListener('click', function() {
        editRouteModal.style.display = "block";
    });

    routeAddBtn.addEventListener('click', function() {
        editRouteModal.style.display = "block";
    });

    // When the user clicks on <span> (x), close the modal
    editRouteModalClose.addEventListener('click', function() {
        editRouteModal.style.display = "none";
    });

    routeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = new FormData(e.target).toJSON();
        form.animals = form.animals === "on" ? true : false;
        form.approved = form.approved === "on" ? true : false;
        form.children = form.children === "on" ? true : false;
        form.disabilities = form.disabilities === "on" ? true : false;
        form.minutes = Number(form.minutes);

        const errorDiv = document.querySelector('#route-edit-modal #errors');

        if (form.id !== "") {
            try {
                const request = await fetch(`/api/routes/${form.id}`, {
                    method: 'put',
                    body: JSON.stringify(form),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const response = await request.json();
                if (response.success) {
                    const routesUpdated = await fetch('/api/routes').then(routes => routes.json());
                    routes.length = 0;
                    routesUpdated.forEach(route => {
                        routes.push(route);
                    });
                    populateRoutesInDataList();
                    editRouteModal.style.display = "none";
                } else {
                    errorDiv.textContent = response;
                }
            } catch(e) {
                errorDiv.textContent = e;
            }
        } else {
            try {
                const request = await fetch(`/api/routes`, {
                    method: 'post',
                    body: JSON.stringify({...form, lines: []}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const response = await request.json();
                if (response.success) {
                    const routesUpdated = await fetch('/api/routes').then(routes => routes.json());
                    routes.length = 0;
                    routesUpdated.forEach(route => {
                        routes.push(route);
                    });
                    populateRoutesInDataList();
                    editRouteModal.style.display = "none";
                } else {
                    errorDiv.textContent = response;
                }
            } catch(e) {
                errorDiv.textContent = e;
            }
        }
    })
}
