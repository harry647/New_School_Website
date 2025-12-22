document.addEventListener("DOMContentLoaded", () => {
    const emailForm = document.getElementById("email-form");
    const questionsForm = document.getElementById("questions-form");
    const resetForm = document.getElementById("reset-form");
    const errorMsg = document.getElementById("errorMsg");

    const q1Label = document.getElementById("question1Label");
    const q2Label = document.getElementById("question2Label");

    let recoveryEmail = "";

    // STEP 1: Submit Email
    emailForm.addEventListener("submit", (e) => {
        e.preventDefault();
        recoveryEmail = document.getElementById("recoveryEmail").value.trim();

        // 🔗 Backend call would go here
        // Example response from backend:
        const mockResponse = {
            success: true,
            questions: [
                "What was the name of your first pet?",
                "What town were you born in?"
            ]
        };

        if (!mockResponse.success) {
            errorMsg.textContent = "Email not found.";
            return;
        }

        q1Label.textContent = mockResponse.questions[0];
        q2Label.textContent = mockResponse.questions[1];

        emailForm.classList.add("d-none");
        questionsForm.classList.remove("d-none");
    });

    // STEP 2: Verify Answers
    questionsForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const answers = {
            email: recoveryEmail,
            answer1: document.getElementById("answer1").value.trim().toLowerCase(),
            answer2: document.getElementById("answer2").value.trim().toLowerCase()
        };

        // 🔗 Backend verification goes here
        const answersCorrect = true; // mock

        if (!answersCorrect) {
            errorMsg.textContent = "Incorrect answers. Please try again.";
            return;
        }

        questionsForm.classList.add("d-none");
        resetForm.classList.remove("d-none");
    });

    // STEP 3: Reset Password
    resetForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const newPass = document.getElementById("newPassword").value;
        const confirmPass = document.getElementById("confirmNewPassword").value;

        if (newPass !== confirmPass) {
            errorMsg.textContent = "Passwords do not match.";
            return;
        }

        // 🔗 Send new password to backend
        alert("Password successfully reset!");
        window.location.href = "login.html";
    });
});
