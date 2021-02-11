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
    const dotTypeList = document.querySelector('#dottype-list');
    const routeInput = document.querySelector('#route-input');
    const routeSelectedLabel = document.querySelector('#route-selected-title');
    const routeEditBtn = document.querySelector('#route-edit');
    const routeForm = document.querySelector('#route-edit-form');
    const routeEditPathBtn = document.querySelector('#route-edit-path');
    const routeEditPathFinishBtn = document.querySelector('#route-edit-path-finish');
    const routeEditPathCancelBtn = document.querySelector('#route-edit-path-cancel');
    const routeEditDotsBtn = document.querySelector('#route-edit-dots');
    const routeEditDotsAddBtn = document.querySelector('#route-edit-dots-add');
    const routeEditDotsFinishBtn = document.querySelector('#route-edit-dots-finish');
    const routeEditDotsCancelBtn = document.querySelector('#route-edit-dots-cancel');
    const routes = await fetch('/api/routes').then(routes => routes.json());
    const dotTypes = await fetch('/api/dot_types').then(dottypes => dottypes.json());

    const editDotsModal = document.getElementById("dots-edit-modal");
    const editDotsModalClose = editDotsModal.querySelector("#dots-edit-modal-close");
    editDotsModalClose.addEventListener('click', function() {
        editDotsModal.style.display = "none";
    });

    const dotsForm = document.querySelector('#dots-edit-form');
    const inputsDots = {
        id: dotsForm.querySelector('[name=id]'),
        description: dotsForm.querySelector('[name=description]'),
        type: dotsForm.querySelector('[name=type]'),
    };

    editDotsModal.querySelector('#delete-dot').addEventListener('click', () => {
        fetch(`/api/routes/${inputsRoute.id.value}/dot/${inputsDots.id.value}`, {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    })

    const dots = [];
    dotsForm.addEventListener('submit', e => {
        e.preventDefault();
        const found = dots.find(dot => dot.dot.id === inputsDots.id.value);
        if (found) {
            found.dot.type = inputsDots.type.value;
            found.dot.description = inputsDots.description.value;
        }
        editDotsModal.style.display = "none";
    });
    routeEditDotsAddBtn.addEventListener('click', e => {
        const dot = {
            id: null,
            description: 'NEW DESCRIPTION',
            position: {
                latitude: 53.9,
                longitude: 27.56
            },
            title: 'NEW DOT',
            type: 'route_start',
        };
        const mapDot = new ymaps.Placemark([dot.position.latitude, dot.position.longitude], {
            hintContent: dot.title
        }, {
            preset: 'islands#blueFoodIcon'
        });
        dots.push({ mapDot, dot: {...dot} });
        myMap.geoObjects.add(mapDot);
    });

    const inputsRoute = {
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

    function populateDotTypesInDataList() {
        dotTypeList.innerHTML = '';
        dotTypes.forEach(dotType => {
            const option = document.createElement('option');
            option.label = dotType.title;
            option.value = dotType.id;
            dotTypeList.appendChild(option);
        });
    }
    populateDotTypesInDataList();

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
        routeEditDotsAddBtn.hidden = true;
        routeEditDotsFinishBtn.hidden = true;
        routeEditDotsCancelBtn.hidden = true;
        routeSelectedLabel.textContent = '-';

        if (!route) {
            return;
        }

        inputsRoute.id.value = route.id;
        inputsRoute.animals.checked = route.animals;
        inputsRoute.approved.checked = route.approved;
        inputsRoute.children.checked = route.children;
        inputsRoute.disabilities.checked = route.disabilities;
        inputsRoute.distance.value = route.distance;
        inputsRoute.minutes.value = route.minutes;
        inputsRoute.title.value = route.title;
        inputsRoute.description.value = route.description;

        myMap.geoObjects.removeAll();
        listenerEditRoutePath && routeEditPathBtn.removeEventListener('click', listenerEditRoutePath);
        listenerEditRoutePathFinish && routeEditPathFinishBtn.removeEventListener('click', listenerEditRoutePathFinish);
        listenerEditRoutePathCancel && routeEditPathCancelBtn.removeEventListener('click', listenerEditRoutePathCancel);

        listenerEditRouteDots && routeEditDotsBtn.removeEventListener('click', listenerEditRouteDots);
        listenerEditRouteDotsFinish && routeEditDotsFinishBtn.removeEventListener('click', listenerEditRouteDotsFinish);
        listenerEditRouteDotsCancel && routeEditDotsCancelBtn.removeEventListener('click', listenerEditRouteDotsCancel);
        routeEditDotsBtn.hidden = false;
        routeEditPathBtn.hidden = false;
        routeEditDotsAddBtn.hidden = false;
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

        dots.length = 0;
        if (route.dots) {
            route.dots.map(dotobj => {
                const dot = dotobj;
                const mapDot = new ymaps.Placemark([dot.position.latitude, dot.position.longitude], {
                    hintContent: dot.title
                }, {
                    preset: 'islands#blueFoodIcon'
                });
                dots.push({ mapDot, dot: {...dot} });
                myMap.geoObjects.add(mapDot);
            })
        }

        myMap.geoObjects.add(myPolyline);
        inputsRoute.distance.value = Math.round(myPolyline.geometry.getDistance() / 10) / 100;

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
            routeEditDotsAddBtn.hidden = true;
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
            routeEditDotsAddBtn.hidden = true;
            routeEditDotsFinishBtn.hidden = false;
            routeEditDotsCancelBtn.hidden = false;
            dots.forEach(dotobj => {
                dotobj.handlerDragend = e => {
                    const coordinates = e.originalEvent.target.geometry.getCoordinates();
                    dotobj.dot.position.latitude = coordinates[0];
                    dotobj.dot.position.longitude = coordinates[1];
                };
                dotobj.handlerClick = e => {
                    editDotsModal.style.display = 'block';
                    inputsDots.id.value = dotobj.dot.id;
                    inputsDots.description.value = dotobj.dot.description;
                    inputsDots.type.value = dotobj.dot.type;
                }
                dotobj.mapDot.editor.startEditing();
                dotobj.mapDot.events.add(['dragend'], dotobj.handlerDragend);
                dotobj.mapDot.events.add(['click'], dotobj.handlerClick);
            });
        }
        listenerEditRouteDotsFinish = async (e) => {
            listenerEditRouteDotsCancel(e);
            if (dots.length === 0) return;
            const dotobj = dots.reduce((acc, dot) => {
                if (dot.dot.id) {
                    acc[dot.dot.id] = dot.dot;
                }
                return acc;
            }, {});
            if (Object.keys(dotobj).length) {
                try {
                    await fetch(`/api/routes/${route.id}/dots`, {
                        method: 'put',
                        body: JSON.stringify(dotobj),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                } catch(e) {
                    console.error(e);
                }
            }
            const newdots = dots.filter(dot => dot.dot.id === null).map(dot => dot.dot);
            if (newdots.length) {
                try {
                    await fetch(`/api/routes/${route.id}/dots`, {
                        method: 'post',
                        body: JSON.stringify(newdots),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                } catch(e) {
                    console.error(e);
                }
            }
        }
        listenerEditRoutePathCancel = e => {
            myPolyline.editor.stopEditing();

            routeEditBtn.hidden = false;

            routeEditPathBtn.hidden = false;
            routeEditPathFinishBtn.hidden = true;
            routeEditPathCancelBtn.hidden = true;

            routeEditDotsBtn.hidden = false;
            routeEditDotsAddBtn.hidden = false;
            routeEditDotsFinishBtn.hidden = true;
            routeEditDotsCancelBtn.hidden = true;
            inputsRoute.distance.value = Math.round(myPolyline.geometry.getDistance() / 10) / 100;
        }
        listenerEditRouteDotsCancel = e => {
            dots.forEach(dotobj => {
                dotobj.mapDot.editor.stopEditing();
                dotobj.mapDot.events.remove('dragend', dotobj.handlerDragend);
                dotobj.mapDot.events.remove('click', dotobj.handlerClick);
            });

            routeEditBtn.hidden = false;

            routeEditPathBtn.hidden = false;
            routeEditPathFinishBtn.hidden = true;
            routeEditPathCancelBtn.hidden = true;

            routeEditDotsBtn.hidden = false;
            routeEditDotsAddBtn.hidden = false;
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
    const editRouteModalClose = editRouteModal.querySelector("#route-edit-modal-close");
    routeEditBtn.addEventListener('click', function() {
        editRouteModal.style.display = "block";
    });

    routeAddBtn.addEventListener('click', function() {
        inputsRoute.id.value = "";
        inputsRoute.animals.checked = false;
        inputsRoute.approved.checked = false;
        inputsRoute.children.checked = false;
        inputsRoute.disabilities.checked = false;
        inputsRoute.distance.value = "";
        inputsRoute.minutes.value = "";
        inputsRoute.title.value = "";
        inputsRoute.description.value = "";
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
