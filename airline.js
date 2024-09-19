import { randomName } from "./names.js";
import { minutesTimer, secondsTimer } from "./timer.js";
import { month } from "./format.js";

function run(svgDoc) {
    var svg = svgDoc.documentElement
    /**
     * Returns a random integer between min (inclusive) and max (inclusive)
     */
    function randomIntBetween(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function array_remove(arr, item) {
        const i = arr.indexOf(item);
        if (i >= 0) {
            arr.splice(i, 1);
        }
    }

    function flash(element) {
        element.style.color = "red";
        window.setTimeout(function () {
            element.style.color = null;
        }, 500);
    }
    function clearStyles(styleSheet) {
        while (styleSheet.cssRules && styleSheet.cssRules.length) {
            styleSheet.deleteRule(0);
        }
    }
    function move_image(image, pt1, pt2, durationMs, callback) {
        if(typeof(image) == "string") {
            image = document.getElementById(image);
        }
        const x1 = pt1.x - image.offsetWidth / 2;
        const x2 = pt2.x - image.offsetWidth / 2;
        const y1 = pt1.y - image.offsetHeight / 2;
        const y2 = pt2.y - image.offsetHeight / 2;

        // Create a unique keyframes name
        const animationName = `moveImage_${image.id}_${Date.now()}`;

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
        const styleId = "style_img_" + image.id;
        var element = document.getElementById(styleId);
        if(element == null) {
            element = document.createElement("style");
            element.id = styleId;
            document.head.appendChild(element);
        }
        const styleSheet = element.sheet;
        clearStyles(styleSheet);
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

    function calculateAngle(pt1, pt2) {
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

    function calculateDistance(pt1, pt2) {
        const distance = Math.sqrt(Math.abs(pt1.x - pt2.x) + Math.abs(pt1.y - pt2.y));
        return distance;
    }

    function centre(element) {
        return {
            x: parseFloat(element.getAttribute('cx')),
            y: parseFloat(element.getAttribute('cy'))
        };
    }

    function findParent(selector, element){
        while (element) {
            if (element.matches(selector)) {
                return element;
            }
            element = element.parentElement;
        }
        return null;
    }

    function getPlaneIcon(plane) {
        if(typeof(plane) == "object") {
            plane = plane.id;
        }
        const divId = "plane_" + plane;
        const icon = document.querySelector("#" + divId + " > svg > path");
        return icon;
    }

    function findWaitingCharter(cityId) {
        for(var i=0; i<charters.length; i++) {
            const charter = charters[i];
            if(charter.from == cityId && charter.plane == null) {
                return charter;
            }
        }
        return null;
    }

    function boardPassengers(plane, charter) {
        if( plane.charter ) {
            return false;
        }
        charter = charter || findWaitingCharter(plane.to);
        if(charter == null) {
            return false;
        }
        if(plane.seats < charter.passengers) {
            flash(document.querySelector("#manifest_" + plane.id + " .seats"));
            flash(document.querySelector("#charter_" + charter.id + " .pax"));
            return false;
        }
        plane.charter = charter;
        charter.plane = plane;
        return charter;
    }
    function deliver_passengers(plane) {
        if( plane.charter == null ) {
            return false;
        }
        const charter = plane.charter;
        if(plane.to == charter.to) {
            array_remove(charters, charter);
            balance += charter.income;
            reputation += charter.reputation;
            plane.charter = null;
            charter.plane = null;
            return true;
        }
        return false;
    }

    const PLANE_SPEED_PER_MS = 4.0 / 1000; // map units per second
    function fly_plane(plane, toId) {
        if(typeof(plane) != "object") {
            plane = find_plane(plane);
        }
        const fromId = plane.to;

        if (plane.status != 'ground') {
            return;
        }
        plane.status = 'air';
        plane.from = fromId;
        plane.to = toId;

        const startElement = svgDoc.getElementById(fromId);
        const endElement = svgDoc.getElementById(toId);

        const startMap = centre(startElement);
        const endMap = centre(endElement);

        const distance = calculateDistance(startMap, endMap);
        const angle = calculateAngle(startMap, endMap);

        const durationMs = distance / PLANE_SPEED_PER_MS;
        const startDom = map_to_dom(startMap.x, startMap.y);
        const endDom = map_to_dom(endMap.x, endMap.y);

        const icon = getPlaneIcon(plane);
        icon.classList.remove("ground");
        icon.classList.add("air");
        if(plane.charter) {
            icon.classList.add("occupied");
        }
        icon.setAttribute('transform', `rotate(${angle}, 50, 50)`);

        updateFields();
        move_image(findParent("div", icon), startDom, endDom, durationMs, function () {
            plane.status = 'ground';
            icon.classList.remove("air");
            icon.classList.add("ground");
            if( deliver_passengers(plane) ) {
                icon.classList.remove("occupied");
            }
            if( boardPassengers(plane) ) {
                icon.classList.add("occupied");
            }
            updateCharters();
            updateFields();
            setPlanePosition(plane);
        });
    }

    const cities = {};
    const startDate = new Date(2025, 0, 1);
    var date = startDate;
    var balance = 50;
    var reputation = 1;
    const planes = [];
    const charters = [];
    var finished = false;

    function dump_state() {
        console.log("Planes", planes);
        console.log("Selected Plane", selected_plane);
        console.log("Charters", charters);
        console.log("Cities", cities);
        console.log("Selected City", selected_city);
    }

    function setPlanePosition(plane) {
        const div = document.getElementById("plane_" + plane.id);
        const city = svgDoc.getElementById(plane.to);
        const c = centre(city);
        const pt = map_to_dom(c.x, c.y);

        const x = Math.round(pt.x - div.offsetWidth / 2);
        const y = Math.round(pt.y - div.offsetHeight / 2);

        div.style.left = x + "px";
        div.style.top = y + "px";

        const style = document.getElementById("style_img_plane_" + plane.id);
        if(style) clearStyles(style.sheet);
    }

    function addPlane() {
        const id = 1 + planes.length;
        const p =
        {
            'id': id,
            'status': 'ground',
            'seats': 2,
            'from': null,
            'to': 'sydney'
        };
        planes.push(p);

        const template = document.getElementById("plane_template");
        const plane = template.cloneNode(true);
        plane.id = "plane_" + id;
        template.parentNode.appendChild(plane);

        setPlanePosition(p);
        selectPlane(p);
    }
    function buy(cost, callback) {
        if (balance < cost) {
            flash(document.getElementById("bank-balance").parentElement);
        } else {
            balance -= cost;
            callback();
        }
    }
    document.getElementById("new_plane").addEventListener('click', function (event) {
        buy(45, () => {
            addPlane();
            updateFields();
        });
    });

    function showTooltip(city) {
        const tt = document.getElementById("tooltip");
        const pt = map_to_dom(city.pos.x + 12, city.pos.y);
        tt.textContent = city.name;
        tt.style.left = pt.x + "px";
        tt.style.top = (pt.y) + "px";
        tt.style.display = "block";
    }

    function clearTooltip() {
        const tt = document.getElementById("tooltip");
        tt.style.display = "none";
        tt.textContent = "";
    }

    function find_plane(predicate) {
        if(typeof(predicate) != "function") {
            predicate = p => {
                return p.id == predicate;
            };
        }
        for(var i=0; i<planes.length; i++) {
            const plane = planes[i];
            if(predicate(plane)) {
                return plane;
            }
        }
        return null;
    }
    function find_plane_in_city(city) {
        return find_plane(plane => {
            if(plane.status == 'ground' && plane.to == city.id) {
                return true;
            } else {
                return false;
            }
        });
    }

    var selected_plane = null;
    function selectPlane(plane) {
        if( plane && typeof(plane) != "object") {
            plane = find_plane(plane);
        }
        if(selected_plane) {
            const icon = getPlaneIcon(selected_plane);
            if(icon) {
                icon.classList.remove("selected");
            }
        }
        selected_plane = plane;
        if(selected_plane) {
            const icon = getPlaneIcon(selected_plane);
            if(icon) {
                icon.classList.add("selected");
            }
        }
        updateFields();
        updateCharters();
    }

    var selected_city = null;
    function click_city(city) {
        clearTooltip();
        if (finished) {
            return;
        }
        if(city.id == selected_city) {
            if(selected_plane) {
                fly_plane(selected_plane, selected_city);
            } else {
               selectPlane(find_plane_in_city(city));  
            }
        } else {
            const p = find_plane_in_city(city);
            if( p == null) {
                selected_city = city.id
                showTooltip(city);
            } else {
                selectPlane(p);
            }
        }
    }
    svgDoc.getElementById('cities').querySelectorAll("circle").forEach(function (city) {
        const p = centre(city);
        const c = {
            "id": city.id,
            "name": city.querySelector("title").textContent,
            "pos": p
        }
        cities[c.id] = c;
        city.addEventListener('click', function (event) {
            click_city(c);
        });
    });

    function updateFields() {
        const manifest = document.getElementById("manifest-container");
        manifest.textContent = "";

        var seats = 0;
        planes.forEach(function (p) {
            seats += p.seats;

            const node = document.createElement("p");
            node.className = "plane";
            if(p.charter) {
                node.classList.add("occupied");
            }
            if(p == selected_plane) {
                node.classList.add("selected");
            }
            node.id = "manifest_" + p.id;
            node.innerHTML = `
                    <span><span class="label">#</span>${p.id}</span>
                    <span><span class="label">Location:</span><span class="location ${p.status}">${cities[p.to].name}</span></span>
                    <span><span class="label">Seats:</span><span class="seats">${p.seats}</span></span>
                `;

            node.addEventListener('click', () => {
                selectPlane(p);
            });

            if (p.seats < 10) {
                const button = document.createElement("button");
                button.title = "Add 2 seats";
                button.className = "upgrade";
                button.innerHTML = 'Upgrade<span class="cost">$25</span>';
                button.addEventListener('click', () => {
                    if (p.seats < 10) {
                        buy(25, () => {
                            p.seats = p.seats + 2;
                            updateFields();
                        });
                    }
                });
                node.appendChild(button);
            }

            manifest.appendChild(node);
        });
        document.getElementById("bank-balance").innerText = balance;
        document.getElementById("reputation").innerText = reputation;
        document.getElementById("plane-count").innerText = planes.length;
        document.getElementById("plane-plural").style.display = planes.length == 1 ? "hidden" : "inline";
        document.getElementById("seat-count").innerText = seats;
        document.getElementById("score").innerText = reputation * seats;
    }
    function updateCharters() {
        const container = document.getElementById("charters-container");
        container.textContent = "";

        charters.forEach(function (flight) {
            const node = document.createElement("p");
            node.className = "charter";
            if(flight.plane) {
                node.classList.add("scheduled");
                if(flight.plane == selected_plane) {
                    node.classList.add("selected");
                }
            }
            node.id = "charter_" + flight.id;
            node.innerHTML = `
                <span class="person">${flight.name}</span>
                <span class="timer"><span class="inner"></span></span>
                <br />
                <span class="label">Income:</span><span class="fare">$${flight.income}</span>
                <span class="label">Reputation:</span><span class="rep">${flight.reputation}</span>
                <br />
                <span class="label">From:</span>
                <span class="origin">${cities[flight.from].name}</span>
                <span class="label">To:</span>
                <span class="destination">${cities[flight.to].name}</span>
                <span class="label">People:</span>
                <span class="pax">${flight.passengers}</span>
            `;
            node.querySelector(".timer .inner").style.width = flight.time_remaining + "px";
            node.addEventListener('click', () => {
                if(flight.plane) selectPlane(flight.plane);
            });

            container.appendChild(node);
        });
    }

    function randomCity(otherThan) {
        if (typeof otherThan == "object") {
            otherThan = otherThan.id;
        }
        const k = Object.keys(cities);
        if (otherThan) {
            array_remove(k, otherThan);
        }
        const c = k[k.length * Math.random() << 0];
        return cities[c];
    }

    function cityDistance(c1, c2) {
        return calculateDistance(cities[c1].pos, cities[c2].pos);
    }

    function addMessage(text, notes, onAccept) {
        const box = document.getElementById("messages");
        const s1 = document.createElement("span");
        s1.innerText = text;
        const b = document.createElement("br");
        s1.appendChild(b);
        const s2 = document.createElement("span");
        s2.innerText = "(" + notes + ")";
        s2.className = "notes";
        s1.appendChild(s2);

        var timerHandle;
        const clearMessage = function () {
            if (timerHandle) {
                timerHandle.cancel();
            }
            box.removeChild(m);
        }

        const a = document.createElement("span");
        a.innerText = "Accept?";
        const y = document.createElement("button");
        y.innerText = "Y";
        const n = document.createElement("button");
        n.innerText = "N";

        n.addEventListener('click', clearMessage);
        y.addEventListener('click', function () {
            clearMessage();
            onAccept();
        });

        const outerTimer = document.createElement("span");
        outerTimer.className = "timer";
        outerTimer.style.width = "25px";
        outerTimer.style.marginLeft = "3px";
        const timer = document.createElement("span");
        timer.className = "inner";
        timer.style.width = "25px";

        outerTimer.appendChild(timer);

        timerHandle = secondsTimer(25, 25, (remaining) => {
            if (finished) {
                clearMessage();
                return;
            }
            timer.style.width = remaining + "px";
        }, clearMessage);

        const m = document.createElement("div");
        m.appendChild(s1);
        m.append(a);
        m.appendChild(y);
        m.appendChild(n);
        m.appendChild(outerTimer);
        box.appendChild(m);
    }

    function failCharter(charter) {
        array_remove(charters, charter);
        if(charter.plane) {
            charter.plane.charter = null;
            getPlaneIcon(charter.plane).classList.remove("occupied");
        }
        reputation -= charter.reputation;
        updateFields();
        updateCharters();
    }

    var charterId = 0;
    function offerCharter() {
        charterId++;
        const fromCity = randomCity();
        const toCity = randomCity(fromCity);
        const dist = cityDistance(fromCity.id, toCity.id);
        const value = (dist < 15 ? 1 : dist < 28 ? 2 : 5);
        const passengers = 1 + Math.min(9, randomIntBetween(0, date.getMonth()));
        const flight = {
            "id": charterId,
            "passengers": passengers,
            "from": fromCity.id,
            "to": toCity.id,
            "income": value * (8 + 2 * passengers),
            "reputation": 3,
            "name": randomName(fromCity.id, toCity.id)
        };
        addMessage(
            `${flight.name} wants to go from ${fromCity.name} to ${toCity.name}`,
            `${flight.passengers} passenger${passengers > 1 ? "s" : ""}, ${flight.reputation} reputation, $${flight.income}`,
            function () {
                charters.push(flight);
                flight.time_remaining = 100;
                secondsTimer(90, 100, (remaining) => {
                    var t = document.querySelector("#charter_" + flight.id + " .timer .inner");
                    if(t) {
                        t.style.width = remaining + "px";
                    }
                    flight.time_remaining = remaining;
                }, () => {
                    failCharter(flight);
                });
                const plane = find_plane_in_city(fromCity);
                if(plane) {
                    boardPassengers(plane, flight);
                }
                updateCharters();
            });
    }

    function game_init() {
        console.log("game: init");
        addPlane();
        offerCharter();
        updateFields();

        const gameMinutes = 10;
        const gameMillisPerRealSecond = (365 * 24 * 60 * 60 * 1000) / (gameMinutes * 60)
        minutesTimer(gameMinutes, function (seconds) {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            document.getElementById("countdown").innerText = m + ":" + (s < 10 ? "0" : "") + s;

            date.setTime(date.getTime() + gameMillisPerRealSecond);
            document.getElementById("month").innerText = month(date);

            if (seconds % 4 == 0) {
                if (document.getElementById("messages").childElementCount < 3) {
                    offerCharter();
                }
            }
        }, function () {
            finished = true;
            window.alert("END");
        });

        const map = document.getElementById("map");
        const resizeObserver = new ResizeObserver(entries => {
            planes.forEach(p => {
                if (p.status == 'ground') {
                    setPlanePosition(p);
                }
            });
            document.body.style.height = window.innerHeight + "px";
        });
        resizeObserver.observe(map);

        document.querySelector("#left-panel .main h2").addEventListener('click', dump_state);

    }
    window.setTimeout(game_init, 5);

}

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM loaded");
    const svgObject = document.getElementById('map');
    document.body.style.height = window.innerHeight + "px";
    var start;
    start = function() {
        const svgDoc = svgObject.contentDocument;
        if (svgDoc) {
            if( svgDoc.getElementById("cities")) {
                console.log("Map is loaded", svgDoc);
                run(svgDoc);
            } else {
                console.log("Map has doc, but no content", svgDoc);
                window.setTimeout(start, 100);
            }
        } else {
            console.log("Adding 'load' listener to map", svgObject);
            svgObject.addEventListener('load', start);
        }
    }
    start();
});