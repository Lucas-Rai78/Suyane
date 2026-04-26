document.querySelectorAll(".flip-card").forEach(card => {
  card.addEventListener("click", () => {
    card.classList.toggle("active")
  })
})

const startDate = new Date("2026-02-24T00:00:00");

const times = document.querySelectorAll(".time");

function updateCounter() {
  const now = new Date();

  const diff = now - startDate;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const days = Math.floor(minutes / 1440);

  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;

  times[0].textContent = days;
  times[1].textContent = remainingMinutes;
  times[2].textContent = remainingSeconds;
}

setInterval(updateCounter, 1000);
updateCounter(); 