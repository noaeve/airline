document.addEventListener('DOMContentLoaded', function () {
    var svgObject = document.getElementById('map');

    svgObject.addEventListener('load', function () {
        var svgDoc = svgObject.contentDocument;
        var svg = svgDoc.documentElement

        function move_image(id, x1, y1, x2, y2) {
            const image = document.getElementById(id);
            x1 -= image.offsetWidth/2;
            x2 -= image.offsetWidth/2;
            y1 -= image.offsetHeight*3/2;
            y2 -= image.offsetHeight*3/2;
            // Create a unique keyframes name
            const animationName = `moveImage_${id}_${Date.now()}`;

            // Generate keyframes dynamically
            const keyframes = `
                @keyframes ${animationName} {
                    0% {
                        left: ${x1}px;
                        top: ${y1}px;
                        opactity: 50%;
                    }
                    1% {
                        opacity: 100%;
                    }
                    99% {
                        opacity: 100%;                        
                    }
                    100% {
                        left: ${x2}px;
                        top: ${y2}px;
                        opacity: 50%;
                    }
                }
            `;

            // Append the keyframes to the document
            const styleSheet = document.getElementById("style_p1");
            styleSheet.sheet.insertRule(keyframes);

            // Apply the animation to the image
            image.style.animation = `${animationName} 6s ease forwards`; // Adjust the timing as needed
        }

        function map_to_dom(x,y) {
            // Current Transformation Matrix
            var svgCTM = svg.getScreenCTM();
            var pt = svg.createSVGPoint();
            pt.x = x;
            pt.y = y;
            return pt.matrixTransform(svgCTM);
        }

        function dom_to_map(x,y) {
            // Current Transformation Matrix
            var svgCTM = svg.getScreenCTM();
            var pt = svg.createSVGPoint();
            pt.x = x;
            pt.y = y;
            return pt.matrixTransform(svgCTM.inverse());
        }

        function animate_plane() {
            const start = svgDoc.getElementById('sydney');
            const end = svgDoc.getElementById('singapore');
            const start_pt = map_to_dom(
                parseFloat(start.getAttribute('cx')),
                parseFloat(start.getAttribute('cy'))
            );
            const end_pt = map_to_dom(
                parseFloat(end.getAttribute('cx')),
                parseFloat(end.getAttribute('cy'))
            );
            move_image("plane", start_pt.x, start_pt.y, end_pt.x, end_pt.y);
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
                animate_plane();
            });
        });

    });
});