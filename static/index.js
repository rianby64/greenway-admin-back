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

    const routesList = document.querySelector('#routes-list');
    const routeInput = document.querySelector('#route-input');
    const routeSelectedLabel = document.querySelector('#route-selected-title');
    const routeEditBtn = document.querySelector('#route-edit');
    const routeEditFinishBtn = document.querySelector('#route-edit-finish');
    const routeEditCancelBtn = document.querySelector('#route-edit-cancel');
    const routes = await fetch('/api/routes').then(routes => routes.json())

    routes.forEach(route => {
        const option = document.createElement('option');
        option.label = route.title;
        option.value = route.id;
        routesList.appendChild(option);
    });

    let listener1 = null;
    let listener2 = null;
    let listener3 = null;

    routeInput.addEventListener('change', (e) => {
        const id = e.target.value;
        const route = routes.find(route => route.id === id);

        routeEditFinishBtn.hidden = true;
        routeEditBtn.hidden = true;
        routeEditCancelBtn.hidden = true;
        routeSelectedLabel.textContent = '-';

        if (!route) {
            return;
        }

        myMap.geoObjects.removeAll();
        listener1 && routeEditBtn.removeEventListener('click', listener1);
        listener2 && routeEditFinishBtn.removeEventListener('click', listener2);
        listener3 && routeEditCancelBtn.removeEventListener('click', listener3);
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
            routeEditBtn.hidden = true;
            routeEditFinishBtn.hidden = false;
            routeEditCancelBtn.hidden = false;
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
            routeEditBtn.hidden = false;
            routeEditFinishBtn.hidden = true;
            routeEditCancelBtn.hidden = true;
        }
        routeEditBtn.addEventListener('click', listener1);
        routeEditFinishBtn.addEventListener('click', listener2);
        routeEditCancelBtn.addEventListener('click', listener3);
    });
}
