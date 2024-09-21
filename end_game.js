function showEndGame(score) {
    const div = document.createElement("div");
    div.className = "final_score";
    div.innerHTML = `<p>Sorry, time is up. Your score is <span>${score}</span></p>`;
    const button = document.createElement("button");
    button.innerText = "Play again";
    button.addEventListener('click', () => {
        div.remove();
        window.location.reload();
    });
    div.appendChild(button);
    document.body.appendChild(div);
}

export { showEndGame };