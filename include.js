Promise.all(
    Array.from(document.querySelectorAll("[data-include]")).map(el =>
        fetch(el.getAttribute("data-include"))
            .then(res => res.text())
            .then(html => { el.outerHTML = html; })
            .catch(() => {})
    )
).then(() => {
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
});
