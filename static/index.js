ymaps.ready(init);

async function init() {
    // Creating the map.
    const myMap = new ymaps.Map("map", {
        center: [53.9, 27.56],
        zoom: 10
    }, {
        searchControlProvider: 'yandex#search'
    });

    const routesList = document.querySelector('#routes-list');
    const routeInput = document.querySelector('#route-input');
    const routeSelectedLabel = document.querySelector('#route-selected-title');
    const routeEditBtn = document.querySelector('#route-edit');
    const routeFinishBtn = document.querySelector('#route-finish');
    const routes = await fetch('/api/routes').then(routes => routes.json())

    routes.forEach(route => {
        const option = document.createElement('option');
        option.label = route.title;
        option.value = route.id;
        routesList.appendChild(option);
    });

    routeInput.addEventListener('change', (e) => {
        const id = e.target.value;
        const route = routes.find(route => route.id === id);
        if (!route) {
            return;
        }

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

        routeEditBtn.addEventListener('click', e => {
            // Adding a line to the map.

            // Turning on the edit mode.
            myPolyline.editor.startEditing();
        });

        routeFinishBtn.addEventListener('click', e => {
            myPolyline.editor.stopEditing();
            console.log(route.lines);
        })
    });
}
