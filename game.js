document.addEventListener('DOMContentLoaded', function () {
    var svgObject = document.getElementById('map');

    svgObject.addEventListener('load', function () {
        var svgDoc = svgObject.contentDocument;
        var svg = svgDoc.documentElement

        function move_image(id, pt1, pt2, durationMs, callback) {
            const image = document.getElementById(id);
            const x1 = pt1.x - image.offsetWidth / 2;
            const x2 = pt2.x - image.offsetWidth / 2;
            const y1 = pt1.y - image.offsetHeight / 2;
            const y2 = pt2.y - image.offsetHeight / 2;

            // Create a unique keyframes name
            const animationName = `moveImage_${id}_${Date.now()}`;

            // Generate keyframes dynamically
            const keyframes = `
                @keyframes ${animationName} {
                    0% {
                        left: ${x1}px;
                        top: ${y1}px;
                        opacity: 100%;
                    }
                    100% {
                        left: ${x2}px;
                        top: ${y2}px;
                        opacity: 100%;
                    }
                }
            `;

            // Append the keyframes to the document
            const styleSheet = document.getElementById("style_p1").sheet;
            while(styleSheet.cssRules && styleSheet.cssRules.length) {
                styleSheet.deleteRule(0);
            }
            styleSheet.insertRule(keyframes);

            // Apply the animation to the image
            image.style.animation = `${animationName} ${durationMs}ms cubic-bezier(0.2, 0, 0.8, 1) forwards`;
            setTimeout(callback, durationMs + 5);
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

        function calculateAngle(pt1 ,pt2) {
            // Calculate the difference in coordinates
            const dx = pt2.x - pt1.x;
            const dy = pt2.y - pt1.y;
            
            // Get the angle in radians
            const angleRadians = Math.atan2(dy, dx);
            
            // Convert the angle to degrees
            let angleDegrees = angleRadians * (180 / Math.PI);
            
            // Normalize the angle to be within the range 0 to 360 degrees
            angleDegrees = (angleDegrees + 360) % 360;
            
            return angleDegrees;
        }

        function calculateDistance(pt1 ,pt2) {
            const distance = Math.sqrt(Math.abs(pt1.x-pt2.x) + Math.abs(pt1.y-pt2.y));
            return distance;
        }

        function centre(element) {
            return {
                x: parseFloat(element.getAttribute('cx')),
                y: parseFloat(element.getAttribute('cy'))
            };
        }

        const PLANE_SPEED_PER_MS = 5.0/1000; // 4 map units per second
        function animate_plane(fromId, toId) {
            const startElement = svgDoc.getElementById(fromId);
            const endElement = svgDoc.getElementById(toId);

            const startMap = centre(startElement);
            const endMap = centre(endElement);
            
            const distance = calculateDistance(startMap, endMap);
            const angle =  calculateAngle(startMap, endMap);

            const durationMs= distance / PLANE_SPEED_PER_MS;
            const startDom = map_to_dom(startMap.x ,startMap.y );
            const endDom = map_to_dom(endMap.x, endMap.y);

            const icon = document.getElementById("plane-path");
            icon.classList = ["air"];
            icon.setAttribute('transform', `rotate(${angle}, 50, 50)`);
            move_image("plane", startDom, endDom, durationMs, function () {
                console.log("callback");
                icon.classList = ["ground"];
            });
        }

        svg.addEventListener('click', function (event) {
            // Transform the click point from screen coordinates to SVG coordinates

            var city = dom_to_map(event.clientX, event.clientY);
            city.x = Math.round(city.x * 100) / 100;
            city.y = Math.round(city.y * 100) / 100;
            console.log('<circle class="city" cx="' + city.x + '" cy="' + city.y + '" r="5" id="XXX"/>');
        });


        var cities = svgDoc.getElementById('cities').querySelectorAll("circle");
        cities.forEach(function (city) {
            city.addEventListener('click', function (event) {
                console.log('City clicked:', this.id);
                animate_plane(this.id, 'sydney');
            });
        });

    });
});