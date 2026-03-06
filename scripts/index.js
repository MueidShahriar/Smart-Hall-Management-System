
const firebaseConfig = {
  apiKey: "AIzaSyBF-nMMW5lG44JfHxx4HxCbf5N81geOiRs",
  authDomain: "bauet-hms-63f5b.firebaseapp.com",
  databaseURL: "https://bauet-hms-63f5b-default-rtdb.firebaseio.com",
  projectId: "bauet-hms-63f5b",
  storageBucket: "bauet-hms-63f5b.appspot.com",
  messagingSenderId: "200038506273",
  appId: "1:200038506273:web:2e141fc9ec36de049ae860"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const firestore = firebase.firestore();

const signInButton = document.getElementById("signInButton");
const signUpButton = document.getElementById("signUpButton");
const signInContainer = document.getElementById("signIn");
const signUpContainer = document.getElementById("signup");
const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");

signInButton.addEventListener("click", () => {
  signInContainer.style.display = "block";
  signUpContainer.style.display = "none";
});
signUpButton.addEventListener("click", () => {
  signInContainer.style.display = "none";
  signUpContainer.style.display = "block";
});

function isValidRoomNumber(roomNumber) {
  const room = parseInt(roomNumber);
  return (
    (room >= 102 && room <= 117) ||
    (room >= 202 && room <= 217) ||
    (room >= 302 && room <= 317) ||
    (room >= 402 && room <= 417) ||
    (room >= 502 && room <= 517) ||
    (room >= 602 && room <= 617)
  );
}

async function createNewRoom(roomNumber) {
  const roomRef = firestore.collection("room").doc(roomNumber);
  await roomRef.set({
    created: firebase.firestore.FieldValue.serverTimestamp(),
    roomNumber: roomNumber
  });
  const promises = [];
  for (let i = 1; i <= 6; i++) {
    promises.push(
      roomRef.collection("members").doc("seat" + i).set({
        isEmpty: true,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      })
    );
  }
  await Promise.all(promises);
}

async function findSeat(roomRef) {
  const seatPromises = [];
  for (let i = 1; i <= 6; i++) {
    seatPromises.push(roomRef.collection("members").doc("seat" + i).get());
  }
  const snapshots = await Promise.all(seatPromises);
  for (let i = 0; i < snapshots.length; i++) {
    if (!snapshots[i].exists || snapshots[i].data().isEmpty === true) {
      return "seat" + (i + 1);
    }
  }
  return null;
}

function setBtn(btn, loading, text) {
  btn.disabled = loading;
  if (loading) {
    btn.classList.add("btn-loading");
  } else {
    btn.classList.remove("btn-loading");
  }
  if (text) btn.value = text;
}

signInForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const btn = signInForm.querySelector('input[type="submit"]');
  const studentId = document.getElementById("loginStudentId").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!studentId || !password) {
    showToast("Please enter Student ID and Password.", "warning");
    return;
  }

  setBtn(btn, true, "Signing in...");

  try {

    const snapshot = await database.ref("users/" + studentId).once("value");

    if (!snapshot.exists()) {

      const pendingDoc = await firestore.collection("PendingStudents").doc(studentId).get();
      if (pendingDoc.exists) {
        showToast("Your registration is pending admin approval.", "warning");
      } else {
        showToast("Student ID not found. Please register first.", "error");
      }
      setBtn(btn, false, "Sign In");
      return;
    }

    const userData = snapshot.val();

    if (!userData.email) {
      showToast("Account data incomplete. Contact admin.", "error");
      setBtn(btn, false, "Sign In");
      return;
    }

    await auth.signInWithEmailAndPassword(userData.email, password);

    sessionStorage.clear();
    sessionStorage.setItem("userId", studentId);

    let targetUrl;
    if (userData.role === "admin") {
      targetUrl = "pages/admin/AdminDashboard.html?id=" + studentId;
    } else {
      targetUrl = "pages/student/StudentDashboard.html?id=" + studentId;
    }

    window.location.href = targetUrl;

  } catch (err) {
    console.error("Login error:", err);

    let msg = "Login failed.";
    if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
      msg = "Wrong password. Please try again.";
    } else if (err.code === "auth/user-not-found") {
      msg = "Auth account not found. Contact admin.";
    } else if (err.code === "auth/too-many-requests") {
      msg = "Too many failed attempts. Try again later.";
    } else if (err.code === "auth/network-request-failed") {
      msg = "Network error. Check your connection.";
    } else if (err.message) {
      msg = err.message;
    }

    showToast(msg, "error");
    setBtn(btn, false, "Sign In");
  }
});

signUpForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const btn = signUpForm.querySelector('input[type="submit"]');
  setBtn(btn, true, "Registering...");

  const studentID = document.getElementById("studentID").value.trim();
  const name = document.getElementById("name").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("cPassword").value;
  const email = document.getElementById("email").value.trim();
  const address = document.getElementById("address").value.trim();
  const fatherName = document.getElementById("fatherName").value.trim();
  const motherName = document.getElementById("motherName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const department = document.getElementById("department").value.trim();
  const batch = document.getElementById("batch").value.trim();
  const room = document.getElementById("room").value.trim();
  const dob = document.getElementById("dob").value;

  if (password !== confirmPassword) {
    showToast("Passwords do not match!", "error");
    setBtn(btn, false, "Sign Up");
    return;
  }

  if (password.length < 6) {
    showToast("Password must be at least 6 characters.", "error");
    setBtn(btn, false, "Sign Up");
    return;
  }

  try {

    const existingUser = await database.ref("users/" + studentID).once("value");
    if (existingUser.exists()) {
      showToast("This Student ID is already registered. Please sign in.", "warning");
      setBtn(btn, false, "Sign Up");
      return;
    }

    const existingPending = await firestore.collection("PendingStudents").doc(studentID).get();
    if (existingPending.exists) {
      showToast("Registration already submitted. Wait for admin approval.", "warning");
      setBtn(btn, false, "Sign Up");
      return;
    }

    if (!isValidRoomNumber(room)) {
      showToast("Room " + room + " is not valid.", "error");
      setBtn(btn, false, "Sign Up");
      return;
    }

    const roomRef = firestore.collection("room").doc(room);
    const roomSnap = await roomRef.get();
    if (!roomSnap.exists) {
      await createNewRoom(room);
    }

    const assignedSeat = await findSeat(roomRef);
    if (!assignedSeat) {
      showToast("Room " + room + " is full. Choose another room.", "warning");
      setBtn(btn, false, "Sign Up");
      return;
    }

    const userCredential = await auth.createUserWithEmailAndPassword(email, password);

    await firestore.collection("PendingStudents").doc(studentID).set({
      name,
      email,
      address,
      father_Name: fatherName,
      mother_Name: motherName,
      phone,
      department,
      batch,
      room,
      dob,
      seat: assignedSeat,
      id: studentID,
      uid: userCredential.user.uid,
      status: "pending",
      createdAt: new Date().toISOString()
    });

    await auth.signOut();

    showToast("Registration submitted! Wait for admin approval.", "success");
    signUpForm.reset();
    signInContainer.style.display = "block";
    signUpContainer.style.display = "none";
    setBtn(btn, false, "Sign Up");

  } catch (err) {
    console.error("Registration error:", err);
    let msg = "Registration failed.";
    if (err.code === "auth/email-already-in-use") {
      msg = "This email is already registered.";
    } else if (err.code === "auth/weak-password") {
      msg = "Password is too weak. Use at least 6 characters.";
    } else if (err.code === "auth/invalid-email") {
      msg = "Invalid email address.";
    } else if (err.message) {
      msg = err.message;
    }
    showToast(msg, "error");
    setBtn(btn, false, "Sign Up");
  }
});

document.querySelectorAll(".toggle-password").forEach(function (toggle) {
  toggle.addEventListener("click", function () {
    const input = this.closest(".input-group").querySelector("input");
    input.type = input.type === "password" ? "text" : "password";
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
  });
});
