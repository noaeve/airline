document.addEventListener('DOMContentLoaded', function () {
    var svgObject = document.getElementById('map');

    svgObject.addEventListener('load', function () {
        var svgDoc = svgObject.contentDocument;
        var svg = svgDoc.documentElement

        const MODE_OFF = 0;
        const MODE_ADD = 1;
        const MODE_DEL = 2;
        var mode = MODE_OFF;

        function server_log(message) {
            fetch("/log", {
                method: "POST",
                body: message,
                headers: {
                  "Content-type": "text/plain; charset=UTF-8"
                }
              });              
        }

        function map_to_dom(x, y) {
            // Current Transformation Matrix
            var svgCTM = svg.getScreenCTM();
            var pt = svg.createSVGPoint();
            pt.x = x;
            pt.y = y;
            return pt.matrixTransform(svgCTM);
        }

        function dom_to_map(x, y) {
            // Current Transformation Matrix
            var svgCTM = svg.getScreenCTM();
            var pt = svg.createSVGPoint();
            pt.x = x;
            pt.y = y;
            return pt.matrixTransform(svgCTM.inverse());
        }

        function set_mode(m) {
            if (mode == MODE_DEL) {
                document.getElementById("delete").classList.remove("active");
            }
            if (mode == MODE_ADD) {
                document.getElementById("add").classList.remove("active");
            }
            mode = m;
            if (mode == MODE_DEL) {
                document.getElementById("delete").classList.add("active");
            }
            if (mode == MODE_ADD) {
                document.getElementById("add").classList.add("active");
            }
        }

        function addClickListener(city) {
            city.addEventListener('click', function (event) {
                if (mode == MODE_DEL) {
                    console.log("remove", this);
                    this.parentElement.removeChild(this);

                    server_log("remove " + this.getAttribute("id"));
                    document.getElementById("delete").classList.remove("active");
                    set_mode(MODE_OFF);
                }
            });
        }

        var cities = svgDoc.getElementById('cities');
        cities.querySelectorAll("circle").forEach(function (city) {
            addClickListener(city);
        });
        function addCity(x, y, name) {
            var city = dom_to_map(x, y);
            city.x = Math.round(city.x * 100) / 100;
            city.y = Math.round(city.y * 100) / 100;

            var circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
            circle.setAttribute("cx", `${city.x}`);
            circle.setAttribute("cy", `${city.y}`);
            circle.setAttribute("r", "5");
            circle.setAttribute("id", name.toLowerCase());
            circle.classList = ["city"];
            addClickListener(circle);

            var title = document.createElementNS("http://www.w3.org/2000/svg", 'title');
            title.textContent = name;
            circle.appendChild(title);
            cities.appendChild(circle);
            console.log(circle);
            
            const ser = new XMLSerializer();
            const str = ser.serializeToString(circle);
            server_log("add " + str);
        }

        document.getElementById("delete").addEventListener('click', function (event) {
            if (mode == MODE_DEL) {
                set_mode(MODE_OFF);
            } else {
                set_mode(MODE_DEL);
            }
        });

        const cityName = document.getElementById("city_name");
        document.getElementById("add").addEventListener('click', function (event) {
            if (mode == MODE_ADD) {
                cityName.setAttribute("disabled", "disabled");
                set_mode(MODE_OFF);
            } else {
                cityName.removeAttribute("disabled");
                set_mode(MODE_ADD);
            }
        });

        svg.addEventListener('click', function (event) {
            if (mode == MODE_ADD) {
                const n = cityName.value;
                if (n) {
                    addCity(event.clientX, event.clientY, n);
                    cityName.value = "";
                }
            }
        });

        const download = document.getElementById("download");
        var url = null;
        download.addEventListener('click', function (event) {
            if (url) {
                URL.revokeObjectURL(url);
            }
            const ser = new XMLSerializer();
            const str = ser.serializeToString(cities);
            const blob = new Blob([str], { type: "text/xml" });
            url = URL.createObjectURL(blob);
            console.log("SVG", cities, str, url);
            download.setAttribute("href", url);
            download.setAttribute("download", "cities.xml");
        });

    });
});