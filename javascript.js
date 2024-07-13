// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        editable: true,
        selectable: true,
        events: []
    });
    calendar.render();

    // Authentication
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const authSection = document.getElementById('auth-section');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        auth.signInWithEmailAndPassword(email, password).catch(error => alert(error.message));
    });

    logoutBtn.addEventListener('click', function() {
        auth.signOut();
    });

    auth.onAuthStateChanged(user => {
        if (user) {
            authSection.style.display = 'none';
            logoutBtn.style.display = 'block';
            loadAppointments(user.uid);
        } else {
            authSection.style.display = 'block';
            logoutBtn.style.display = 'none';
        }
    });

    // Form submission
    document.getElementById('schedule-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const appointmentDetails = document.getElementById('appointment').value;
        const appointmentDatetime = document.getElementById('datetime').value;
        const userId = auth.currentUser.uid;

        if (appointmentDetails && appointmentDatetime) {
            addAppointment(calendar, userId, appointmentDetails, appointmentDatetime);
            document.getElementById('schedule-form').reset();
        }
    });
});

function addAppointment(calendar, userId, details, datetime) {
    const event = {
        title: details,
        start: datetime,
        allDay: false,
        userId: userId
    };
    db.collection('appointments').add(event).then(() => {
        calendar.addEvent(event);
        notifyUser('Appointment added successfully!');
    });
}

function loadAppointments(userId) {
    db.collection('appointments').where('userId', '==', userId).get().then(snapshot => {
        snapshot.forEach(doc => {
            const event = doc.data();
            event.id = doc.id;
            calendar.addEvent(event);
        });
    });
}

function notifyUser(message) {
    if (Notification.permission === 'granted') {
        new Notification(message);
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(message);
            }
        });
    }
}
