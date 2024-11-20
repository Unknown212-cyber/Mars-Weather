// Function to fetch Mars Weather Data and handle potential errors
function fetchMarsWeatherData() {
    const apiKey = 'T2zXGCv6XiqaGSdDyLoZTFw65n29He4tSpwEc2pE'; // Your NASA API Key
    const url = `https://api.nasa.gov/insight_weather/?api_key=${apiKey}&feedtype=json&ver=1.0`;

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else if (response.status === 429) {
                alert("API rate limit exceeded. Please try again later.");
                return Promise.reject("Rate limit exceeded");
            } else {
                return Promise.reject("Error fetching data");
            }
        })
        .then(data => {
            displayWeatherData(data);
            displayWindDirection(data);
            generateTemperatureChart(data);
        })
        .catch(error => {
            console.error("Error:", error);
            document.getElementById('weather-info').innerHTML = '<p>Data could not be fetched at this time.</p>';
        });
}

// Function to display weather data
function displayWeatherData(data) {
    const weatherDiv = document.getElementById('weather-info');

    const solData = data[Object.keys(data)[0]];
    if (solData && solData.AT && solData.HWS && solData.PRE) {
        weatherDiv.innerHTML = `
        <p><strong>Season:</strong> ${solData.Season}</p>
        <p><strong>Temperature (Avg.):</strong> ${solData.AT.av} °F</p>
        <p><strong>Wind Speed (Avg.):</strong> ${solData.HWS.av} m/s</p>
        <p><strong>Pressure (Avg.):</strong> ${solData.PRE.av} Pa</p>
      `;
    } else {
        weatherDiv.innerHTML = "<p>Weather data not available.</p>";
    }
}

// Function to display wind direction
function displayWindDirection(data) {
    const windRose = document.getElementById('wind-rose');
    const mostCommon = data[Object.keys(data)[0]].WD.most_common;
    if (mostCommon) {
        windRose.innerHTML = `
        <p><strong>Most Common Wind Direction:</strong> ${mostCommon.compass_point} (${mostCommon.compass_degrees}°)</p>
        <p><strong>Wind Count:</strong> ${mostCommon.ct}</p>
      `;
    } else {
        windRose.innerHTML = "<p>Wind data not available.</p>";
    }
}

// Function to generate the temperature chart using Chart.js
function generateTemperatureChart(data) {
    const ctx = document.getElementById('temperature-chart').getContext('2d');

    // Filter and map sol data
    const solKeys = Object.keys(data).filter(key => !isNaN(key)); // Filter valid sol keys
    const temperatureData = solKeys.map(sol => data[sol]?.AT?.av ?? null); // Use null for missing data
    const labels = solKeys.map(sol => `Sol ${sol}`);

    // Check if temperature data is valid
    if (temperatureData.every(temp => temp === null)) {
        document.getElementById('temperature-chart-container').innerHTML = "<p>No valid temperature data available for charting.</p>";
        return;
    }

    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Average Temperature (°F)',
            data: temperatureData,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
    };

    const config = {
        type: 'line',
        data: chartData,
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            },
            responsive: true
        }
    };

    // Create Chart
    new Chart(ctx, config);
}

// Render Mars Globe
function renderMarsGlobe() {
    const container = document.getElementById('mars-globe-container');

    // Ensure the container has proper dimensions
    container.style.width = "100%";
    container.style.height = "400px";

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Mars texture
    const marsTexture = new THREE.TextureLoader().load('https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/2023/09/6/6453_mars-globe-valles-marineris-enhanced-full2.jpg?w=4096&format=jpeg&fit=clip&crop=faces%2Cfocalpoint', () => {
        animate(); // Start animation after the texture loads
    });

    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ map: marsTexture });
    const mars = new THREE.Mesh(geometry, material);

    scene.add(mars);
    camera.position.z = 10;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        mars.rotation.y += 0.01; // Spin the globe
        renderer.render(scene, camera);
    }
}


// Mars Quiz
const quizQuestions = [
    {
        question: "What is the average temperature on Mars?",
        options: ["-80°F", "32°F", "212°F"],
        answer: "-80°F"
    },
    {
        question: "What is the name of the largest volcano on Mars?",
        options: ["Mount Everest", "Olympus Mons", "Mauna Loa"],
        answer: "Olympus Mons"
    }
];

let currentQuestion = 0;
function displayQuiz() {
    const quizContainer = document.getElementById("quiz-container");
    const quizQuestion = document.getElementById("quiz-question");
    const quizOptions = document.getElementById("quiz-options");

    if (currentQuestion < quizQuestions.length) {
        const question = quizQuestions[currentQuestion];
        quizQuestion.textContent = question.question;
        quizOptions.innerHTML = "";
        question.options.forEach(option => {
            const button = document.createElement("button");
            button.textContent = option;
            button.addEventListener("click", () => {
                if (option === question.answer) {
                    alert("Correct!");
                } else {
                    alert("Wrong answer. Try again!");
                }
                currentQuestion++;
                displayQuiz();
            });
            quizOptions.appendChild(button);
        });
    } else {
        quizContainer.innerHTML = "<p>You've completed the quiz!</p>";
    }
}

// Initialize the app and fetch the data
window.onload = function () {
    fetchMarsWeatherData();
    renderMarsGlobe();
    displayQuiz();
};
