function showPage(page, prevInfo, nextInfo) {
    const div = document.createElement("div");
    div.className = "rules";
    div.innerHTML = page;
    if (prevInfo) {
        const button = document.createElement("button");
        button.innerText = prevInfo.text;
        button.className = "previous";
        button.addEventListener('click', () => {
            div.remove();
            prevInfo.action()
        });
        div.appendChild(button);
    }
    if (nextInfo) {
        const button = document.createElement("button");
        button.innerText = nextInfo.text;
        button.className = "next";
        button.addEventListener('click', () => {
            div.remove();
            nextInfo.action();
        });
        div.appendChild(button);
    }
    document.body.appendChild(div);
    return {
        'close': () => { div.remove(); }
    };
}

const pages = [
    `<p>
 In this game you run a charter airline company.<br/>
 The aim is to get a high score.
 </p>
 <p>
 You get a high score by taking people to where they want to go.<br />
 Your score will be based on your reputation, and your seats in total.<br />
 </p>
 <p>
 You get a good reputation by helping people without earning money or taking someone somewhere when you say you will and to the right place.
 But if you don't do these things, you get a bad reputation.
 </p>
 <p> 
 You can get more seats in a plane by spending money you can also buy new planes.<br />
 Each plane starts with two seats and can get a Max of 10 seats.
</p>`,

    `<p>You have 10 minutes to do as much as you can.
  </p>
 <p>
 You start with just singular people then as the game goes on you will get bigger groups.
</p>
<p>
There are also festivals which means a lot of people will want to go to certain countries at the same time.
There are disasters as well, such as earthquakes, fires and floods where you can help people without earning
money but you get more reputaion.
  </p>
 <p>
 Tap a city to select it then tap again to make your plane fly there. 
  </p>
 <p>
 There is airline information on the left-hand side and messages will pop up on the bottom left corner of the map.
   </p>
`,
    "<p>Your time starts ...</p><p id='now'>Now! 😉</p>"
];

function showRules(callback) {
    let page;
    page = (n) => {
        if (n >= pages.length) {
            callback();
            return;
        }
        const x = showPage(pages[n],
            n == 0 ? null : { "text": "Previous", "action": () => { page(n - 1); } },
            n == pages.length - 1 ? null : { "text": "Next", "action": () => { page(n + 1); } }
        );
        if(n == pages.length - 1) {
            window.setTimeout(() => {
                document.getElementById("now").style.opacity = 1;
                window.setTimeout(() => {
                    x.close();
                    callback();
                }, 1000);
            }, 2000);
        }
    }
    page(0);
}

export { showRules };