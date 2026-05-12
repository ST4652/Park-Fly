const express = require("express");
const path    = require("path");

const app  = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/reserve", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, plate, startTime, endTime } = req.body;

    if (!firstName || !lastName || !email || !phone || !plate || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const payload = {
      firstName,
      lastName,
      email,
      phoneNumber: phone,
      mediums: [
        {
          type: "LICENSEPLATE",
          encoding: "HEX",
          value: plate.toUpperCase(),
          licencePlateRegion: {
            code: plate.substring(0, 2).toUpperCase(),
            country: "SVK",
          },
          status: "VALIDATED",
        },
      ],
      visit: {
        startTime,
        endTime,
        contractBusinessId: "A2026X0qTl9Woq",
        productBusinessId:  "PP000037",
        facilitiesBusinessId: ["FC2754897"],
      },
    };

    console.log("SENDING:", JSON.stringify(payload, null, 2));

    const response = await fetch(
      "http://localhost:9080/customers-contracts/v2/de_studentui/consumers/visitor",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    console.log("API RESPONSE:", response.status, JSON.stringify(data, null, 2));

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error("Reserve error:", error);
    res.status(500).json({ message: "Server error. Is the parking API running on port 9080?" });
  }
});

app.get("/api/search/:plate", async (req, res) => {
  try {
    const plate = req.params.plate.toUpperCase();

    const response = await fetch(
      "http://localhost:9080/customers-contracts/v2/de_studentui/customers/C2026CNeRR6w/contracts/A2026X0qTl9Woq/consumers/visitor"
    );

    const data = await response.json();

    const visitor = data.content?.find((item) =>
      item.licensePlates?.some((p) => p.toUpperCase() === plate)
    );

    if (!visitor) {
      return res.status(404).json({ message: "Rezervácia nebola nájdená" });
    }

    res.json(visitor);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});