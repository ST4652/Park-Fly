async function createBooking(event) {
    event.preventDefault();

    const message = document.getElementById("status");

    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const plate = document.getElementById("licensePlate").value;

    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;

    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    if (endDateTime <= startDateTime) {
        message.innerHTML = "Koniec rezervácie musí byť po začiatku.";
        message.style.color = "#ef4444";
        return;
    }

    message.innerHTML = "Vytváram rezerváciu...";
    message.style.color = "white";

    try {
        const response = await fetch("/api/reserve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                firstName,
                lastName,
                email,
                phone,
                plate,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
            }),
        });

        const result = await response.json();

        if (response.ok) {
            message.innerHTML = "✅ Rezervácia bola úspešná!";
            message.style.color = "#22c55e";
            document.getElementById("reservationForm").reset();
        } else {
            message.innerHTML = result.message || "❌ Rezervácia zlyhala";
            message.style.color = "#ef4444";
            console.log("Error:", result);
        }

    } catch (error) {
        console.error(error);
        message.innerHTML = "❌ Chyba servera";
        message.style.color = "#ef4444";
    }
}

document
    .getElementById("reservationForm")
    .addEventListener("submit", createBooking);