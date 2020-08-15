ymaps.ready(init);

async function init() {
    // Creating the map.
    const myMap = new ymaps.Map("map", {
        center: [53.9, 27.56],
        zoom: 10
    }, {
        searchControlProvider: 'yandex#search'
    });

    const routeAddBtn = document.querySelector('#route-add');
    const routesList = document.querySelector('#routes-list');
    const routeInput = document.querySelector('#route-input');
    const routeSelectedLabel = document.querySelector('#route-selected-title');
    const routeEditBtn = document.querySelector('#route-edit');
    const routeForm = document.querySelector('#route-edit-form');
    const routeEditPathBtn = document.querySelector('#route-edit-path');
    const routeEditPathFinishBtn = document.querySelector('#route-edit-path-finish');
    const routeEditPathCancelBtn = document.querySelector('#route-edit-path-cancel');
    const routeEditDotsBtn = document.querySelector('#route-edit-dots');
    const routeEditDotsFinishBtn = document.querySelector('#route-edit-dots-finish');
    const routeEditDotsCancelBtn = document.querySelector('#route-edit-dots-cancel');
    const routes = await fetch('/api/routes').then(routes => routes.json());

    const inputs = {
        id: routeForm.querySelector('[name=id]'),
        animals: routeForm.querySelector('[name=animals]'),
        approved: routeForm.querySelector('[name=approved]'),
        children: routeForm.querySelector('[name=children]'),
        disabilities: routeForm.querySelector('[name=disabilities]'),
        distance: routeForm.querySelector('[name=distance]'),
        minutes: routeForm.querySelector('[name=minutes]'),
        title: routeForm.querySelector('[name=title]'),
        description: routeForm.querySelector('[name=description]')
    };

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

    let listenerEditRoutePath = null;
    let listenerEditRoutePathFinish = null;
    let listenerEditRoutePathCancel = null;
    let listenerEditRouteDots = null;
    let listenerEditRouteDotsFinish = null;
    let listenerEditRouteDotsCancel = null;

    routeInput.addEventListener('change', (e) => {
        const id = e.target.value;
        const route = routes.find(route => route.id === id);

        routeEditBtn.hidden = true;
        routeEditPathBtn.hidden = true;
        routeEditPathFinishBtn.hidden = true;
        routeEditPathCancelBtn.hidden = true;
        routeEditDotsBtn.hidden = true;
        routeEditDotsFinishBtn.hidden = true;
        routeEditDotsCancelBtn.hidden = true;
        routeSelectedLabel.textContent = '-';

        if (!route) {
            return;
        }

        inputs.id.value = route.id;
        inputs.animals.checked = route.animals;
        inputs.approved.checked = route.approved;
        inputs.children.checked = route.children;
        inputs.disabilities.checked = route.disabilities;
        inputs.distance.value = route.distance;
        inputs.minutes.value = route.minutes;
        inputs.title.value = route.title;
        inputs.description.value = route.description;

        myMap.geoObjects.removeAll();
        listenerEditRoutePath && routeEditPathBtn.removeEventListener('click', listenerEditRoutePath);
        listenerEditRoutePathFinish && routeEditPathFinishBtn.removeEventListener('click', listenerEditRoutePathFinish);
        listenerEditRoutePathCancel && routeEditPathCancelBtn.removeEventListener('click', listenerEditRoutePathCancel);

        listenerEditRouteDots && routeEditDotsBtn.removeEventListener('click', listenerEditRouteDots);
        listenerEditRouteDotsFinish && routeEditDotsFinishBtn.removeEventListener('click', listenerEditRouteDotsFinish);
        listenerEditRouteDotsCancel && routeEditDotsCancelBtn.removeEventListener('click', listenerEditRouteDotsCancel);
        routeEditDotsBtn.hidden = false;
        routeEditPathBtn.hidden = false;
        routeEditBtn.hidden = false;
        routeSelectedLabel.textContent = route.title;

        const line = route.lines.map(line => [line.latitude, line.longitude]);
        if (line.length === 0) {
            line.push([53.9, 27.56]);
        }
        // Creating a polyline.
        const myPolyline = new ymaps.Polyline(
            // Specifying the coordinates of the vertices.
            line,
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

        const dots = [];
        if (route.dots) {
            route.dots.map(dotobj => {
                const dot = dotobj;
                mapDot = new ymaps.Placemark([dot.position.latitude, dot.position.longitude], {
                    hintContent: dot.title
                }, {
                    preset: 'islands#blueFoodIcon'
                });
                dots.push({ mapDot, dot: {...dot} });
                myMap.geoObjects.add(mapDot);
            })
        }

        myMap.geoObjects.add(myPolyline);
        inputs.distance.value = Math.round(myPolyline.geometry.getDistance() / 10) / 100;

        myPolyline.events.add(['editorstatechange'], e => {
            const coords = e.originalEvent.target.geometry.getCoordinates();
            route.lines = coords.map(coord => {
                return {
                    latitude: coord[0],
                    longitude: coord[1],
                };
            });
        });

        listenerEditRoutePath = e => {
            myPolyline.editor.startEditing();
            routeEditBtn.hidden = true;

            routeEditPathBtn.hidden = true;
            routeEditPathFinishBtn.hidden = false;
            routeEditPathCancelBtn.hidden = false;

            routeEditDotsBtn.hidden = true;
            routeEditDotsFinishBtn.hidden = true;
            routeEditDotsCancelBtn.hidden = true;
        };
        listenerEditRoutePathFinish = e => {
            listenerEditRoutePathCancel(e);
            fetch(`/api/routes/${route.id}/lines`, {
                method: 'put',
                body: JSON.stringify(route.lines),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        };

        listenerEditRouteDots = e => {
            routeEditBtn.hidden = true;

            routeEditPathBtn.hidden = true;
            routeEditPathFinishBtn.hidden = true;
            routeEditPathCancelBtn.hidden = true;

            routeEditDotsBtn.hidden = true;
            routeEditDotsFinishBtn.hidden = false;
            routeEditDotsCancelBtn.hidden = false;
            dots.forEach(dotobj => {
                dotobj.handler = e => {
                    const coordinates = e.originalEvent.target.geometry.getCoordinates();
                    dotobj.dot.position.latitude = coordinates[0];
                    dotobj.dot.position.longitude = coordinates[1];
                };
                dotobj.mapDot.editor.startEditing();
                dotobj.mapDot.events.add(['dragend'], dotobj.handler);
            });
        }
        listenerEditRouteDotsFinish = e => {
            const dotobj = dots.reduce((acc, dot) => {
                if (dot.dot.id) {
                    acc[dot.dot.id] = dot.dot;
                }
                return acc;
            }, {});
            fetch(`/api/routes/${route.id}/dots`, {
                method: 'put',
                body: JSON.stringify(dotobj),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(() => {


            });

            listenerEditRouteDotsCancel(e);
            //console.log(dots); // this is what I'd like to upload, eventually
            //console.log(route.dots); // and this is the original data

        }
        listenerEditRoutePathCancel = e => {
            myPolyline.editor.stopEditing();

            routeEditBtn.hidden = false;

            routeEditPathBtn.hidden = false;
            routeEditPathFinishBtn.hidden = true;
            routeEditPathCancelBtn.hidden = true;

            routeEditDotsBtn.hidden = false;
            routeEditDotsFinishBtn.hidden = true;
            routeEditDotsCancelBtn.hidden = true;
            inputs.distance.value = Math.round(myPolyline.geometry.getDistance() / 10) / 100;
        }
        listenerEditRouteDotsCancel = e => {
            dots.forEach(dotobj => {
                dotobj.mapDot.editor.stopEditing();
                dotobj.mapDot.events.remove('dragend', dotobj.handler);
            });

            routeEditBtn.hidden = false;

            routeEditPathBtn.hidden = false;
            routeEditPathFinishBtn.hidden = true;
            routeEditPathCancelBtn.hidden = true;

            routeEditDotsBtn.hidden = false;
            routeEditDotsFinishBtn.hidden = true;
            routeEditDotsCancelBtn.hidden = true;
        };
        routeEditPathBtn.addEventListener('click', listenerEditRoutePath);
        routeEditPathFinishBtn.addEventListener('click', listenerEditRoutePathFinish);
        routeEditPathCancelBtn.addEventListener('click', listenerEditRoutePathCancel);
        routeEditDotsBtn.addEventListener('click', listenerEditRouteDots);
        routeEditDotsFinishBtn.addEventListener('click', listenerEditRouteDotsFinish);
        routeEditDotsCancelBtn.addEventListener('click', listenerEditRouteDotsCancel);
    });

    const editRouteModal = document.getElementById("route-edit-modal");

    // Get the <span> element that closes the modal
    const editRouteModalClose = document.getElementById("route-edit-modal-close");

    routeEditBtn.addEventListener('click', function() {
        editRouteModal.style.display = "block";
    });

    routeAddBtn.addEventListener('click', function() {
        inputs.id.value = "";
        inputs.animals.checked = false;
        inputs.approved.checked = false;
        inputs.children.checked = false;
        inputs.disabilities.checked = false;
        inputs.distance.value = "";
        inputs.minutes.value = "";
        inputs.title.value = "";
        inputs.description.value = "";
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
        form.distance = Number(form.distance);

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
