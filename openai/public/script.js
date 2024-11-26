// Handle the click event for the send button
document.getElementById("send-btn").addEventListener("click", sendMessage);

// Handle the Enter key press event for the input field
document.getElementById("user-input").addEventListener("keypress", function (e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevent the default action (like form submission)
        sendMessage();      // Trigger the sendMessage function
    }
});

// Send the message to the chatbot
function sendMessage() {
    const inputField = document.getElementById("user-input");
    const userInput = inputField.value.trim();

    if (userInput === "") return; // Don't send empty messages

    // Display the user's message in the chat window
    displayMessage(userInput, 'user');

    // Send the user's input to the backend (chatbot)
    fetch("/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: userInput })
    })
    .then(response => response.json())
    .then(data => {
        // Display the chatbot's response in the chat window
        displayMessage(data.reply, 'chatbot');
        inputField.value = ""; // Clear the input field after sending
        inputField.focus();    // Focus back to the input field
    })
    .catch(error => {
        console.error("Error:", error);
        displayMessage("Sorry, something went wrong. Please try again later.", 'chatbot');
    });
}

// Function to escape HTML special characters and remove HTML tags
function sanitizeMessage(message) {
    // Create a temporary DOM element to parse and extract the plain text
    let div = document.createElement('div');
    div.innerHTML = message;
    return div.innerText || div.textContent || ""; // Get the plain text from the HTML
}

// Function to display a message in the chat window
function displayMessage(message, sender) {
    // Sanitize the message to remove HTML tags
    const sanitizedMessage = sanitizeMessage(message);

    const messagesContainer = document.getElementById("messages");

    const messageElement = document.createElement("div");
    messageElement.classList.add(sender === 'user' ? 'user-message' : 'chatbot-message');
    messageElement.textContent = sanitizedMessage;

    messagesContainer.appendChild(messageElement);

    // Scroll to the bottom of the chat window
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
