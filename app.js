import {
    getAuth, createUserWithEmailAndPassword, auth, signInWithEmailAndPassword, onAuthStateChanged, signOut,
    db, getFirestore, collection, addDoc, doc, onSnapshot, setDoc, getDoc, updateDoc, getDocs,
    query, where, serverTimestamp, orderBy,
    storage, ref, uploadBytesResumable, getDownloadURL
} from "./firebase.js";
// ==========================================================================
// ================================ signup create user ======================
// ==========================================================================
// ========================================================
// 1: sign page get ids & value (email , password , button)

let signupEmail = document.getElementById("signup-email");
let signupPassword = document.getElementById("signup-password");
let signupBtn = document.getElementById("signup-btn");
let signupUserName = document.getElementById("signup-user-name");
let profileImage = document.getElementById("profile-image");
let loader = document.getElementById("loader");
// loader.style.display = "block";
// ================================
// 2: click sign up btn create user

signupBtn && signupBtn.addEventListener("click", () => {
    //===================================================
    //  3: check value console (email , password , value)
    console.log(signupEmail.value, signupPassword.value, signupBtn)
    if (signupEmail.value.trim() === "") {
        alert("empty email")
    }
    else if (signupPassword.value.trim() === "") {
        alert("empty password")
    }
    else if (signupUserName.value.trim() === "") {
        alert("empty name")
    }
    else {
        loader.style.display = "block";
        createUserWithEmailAndPassword(auth, signupEmail.value, signupPassword.value)
            .then(async (userCredential) => {
                // ====================
                // 4: Signed up check user
                const user = userCredential.user;
                console.log("signup user sucess --->", user)
                // =========================
                // USER NAME DATA BASE SAVE
                await setDoc(doc(db, "userData", auth.currentUser.uid), {
                    user_email: signupEmail.value,
                    user_name: signupUserName.value,
                    user_id: auth.currentUser.uid
                });
                alert("registered successfully")
                loader.style.display = "none";

            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log("signup user error --->", errorMessage)
                loader.style.display = "none";

                alert(errorCode)
            });
    }
})
// ===================== sign up compete ========================== 
// =====================******************=========================

// ===============================================================
// ============================LOGIN PAGE=========================
// ===============================================================

// ========================================================
// 1: sign page get ids & value (email , password , button)

let loginEmail = document.getElementById("login-email");
let loginPassword = document.getElementById("login-password");
let loginBtn = document.getElementById("login-btn");

// 2: click sign in check user to login

loginBtn && loginBtn.addEventListener("click", () => {
    //===================================================
    //  3: check value console (email , password , value)
    console.log(loginEmail.value, loginPassword.value)
    if (loginEmail.value.trim() === "") {
        alert("empty email")
    }
    else if (loginPassword.value.trim() === "") {
        alert("empty password")
    }
    else {
        loader.style.display = "block";
        signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value)
            .then((userCredential) => {
                // Signed in user 

                const user = userCredential.user;
                console.log("login check user --->", user)
                alert("login successfully")
                loader.style.display = "none";
                location.href = "./profile.html"
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log("login user error----> ", errorMessage)
                loader.style.display = "none";

                alert(errorCode)
            });
    }
});
// ===========================================================
// ==================== on auth change =======================
// ===========================================================

// ===========================================================
// =================== PROFILE PAGE GET IDS ==================
// ===========================================================
let profileUsername = document.getElementById("profile-user-name");
let messageUsername = document.getElementById("message-user-name");
let messageUserImage = document.getElementById("message-user-image");
let profileEmail = document.getElementById("profile-email");

onAuthStateChanged(auth, async (user) => {
    // =============================
    if (user) {
        getUser(user.uid)
        console.log("user id--------------->", auth.currentUser.uid);
        loader.style.display = "block";
        const docRef = doc(db, "userData", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        //  ========================
        // 1 : GET DATA FIRE BABSE
        //  2 : CHECK CONDITON AGAR USER KA DATA FIRE STORE MAI HO TO PHIR USA PROFILE PAR JANA DO
        if (docSnap.exists()) {
            // 3: PHIR LOCATION CHANGE KARI HAI  
            if (location.pathname !== "/profile.html" && location.pathname !== "/index.html") {
                location.href = "./profile.html";
            }
            if (location.pathname == "/index.html") {
                messageUsername.innerHTML = docSnap.data().user_name;
                messageUserImage.src = docSnap.data().photoUrl;
            }
            //4: YA DATA FIRE STORE SA A RHA HA OR PROFILE PAR RENDER HO RAHA HAI
            if (location.pathname == "/profile.html") {
                profileUsername.innerHTML = docSnap.data().user_name;
                profileEmail.innerHTML = docSnap.data().user_email;
                if (docSnap.data().photoUrl) {
                    profileImage.src = docSnap.data().photoUrl;


                }
                loader.style.display = "none";
            }



            console.log("Current data------>: ", docSnap.data());
        } else {
            // docSnap.data() will be undefined in this case
            //5: AGAR FIRE STORE MAI DATA NI HOA TO USER WAPIS LOGIN PAGE PAR JAY GA 
            console.log("No such document!");
            if (location.pathname !== "/login.html" && location.pathname !== "/signup.html") {
                window.location.href = "./login.html"
            }
        }

    } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
        //6: AGAR USER  NI HOA TO USER WAPIS LOGIN PAGE PAR JAY GA 
        if (location.pathname !== "/login.html" && location.pathname !== "/signup.html") {
            window.location.href = "./login.html"
        }
    }
});
// =====================================================================
// ====================================== Logout =======================
// =====================================================================
let logOutBtn = document.getElementById("logout-btn");
logOutBtn && logOutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
        // Sign-out successful.
        loader.style.display = "block";

        alert("logout successfully")
        loader.style.display = "none";

        location.href = "./login.html"

    }).catch((error) => {
        alert(error)
        // An error happened.
    });
})
// ================================================================================
//============================= UDAPTE PROFILE ====================================
// ================================================================================
// 1: GET IDS 
let profileImageFile = document.getElementById("profile-image-file");

profileImageFile && profileImageFile.addEventListener("change", () => {
    console.log(event.target.files[0]);
    profileImage.src = URL.createObjectURL(event.target.files[0]);
})
// ========================================================
// 2: ======================== PROFILE STORAGE FUNCTON WITH 
let profileImageFunction = (file) => {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `images/${auth.currentUser.uid}`);

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
            },
            (error) => {
                reject(error)
            },
            () => {

                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    resolve(downloadURL)
                });
            }
        );

    })
};
// ========================= UPDATE BUTTON CLICK 
// =============================================
let updateProfileBtn = document.getElementById("update-profile-btn");
updateProfileBtn && updateProfileBtn.addEventListener("click", async () => {
    // console.log(profileImageFile.files.length);
    // console.log(auth.currentUser.uid);
    if (profileImageFile.files.length == 0) {
        alert("please select image")
    }
    else {
        try {
            let photoUrl = await profileImageFunction(profileImageFile.files[0]);
            const UserImageRef = doc(db, "userData", auth.currentUser.uid);
            await updateDoc(UserImageRef, {
                photoUrl
            });
            alert("profile updated")
            console.log(photoUrl);
            console.log(profileEmail.value, profileUsername.value);
        }
        catch (error) {
            console.log(error);
        }
    }
})

// =====================  meassages functionallity ===================
// ===================================================================
// 1: GET PARENT DIV ID AND USER ADD  
let userAdd = document.getElementById("user-add");
let getUser = async (userId) => {
    const q = query(collection(db, "userData"), where("user_id", "!=", userId));
    const querySnapshot = await getDocs(q);
    loader.style.display = "none";
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        if (location.pathname == "/index.html") {

            userAdd.innerHTML += `
            <div
            class="flex flex-row py-4 px-2 justify-center items-center border-b-2"
              onclick="messages('${doc.data().user_id}')" >
            <div class="w-1/4">
            <img
            src="${doc.data().photoUrl}"
            class="object-cover h-12 w-12 rounded-full"
            alt=""
            />
            </div>
            <div class="w-full">
            <div class="text-lg font-semibold">${doc.data().user_email}</div>
            <span class="text-gray-500">Pick me at 9:00 Am</span>
            </div>
            </div>`

        }
    });
}

let usersChatID = "";
let sender = "";
let navbarName = document.getElementById("navbar-name")
let navbarImage = document.getElementById("navbar-image")
let messageShow = document.getElementById("message-show")
let messages = (userId) => {
    sender = userId;
    messageShow.innerHTML = "";
    console.log(userId);
    console.log(auth.currentUser.uid);
    let currentUserId = auth.currentUser.uid;
    let chatId = "";
    if (currentUserId < userId) {
        chatId = userId + currentUserId;
    }
    else {
        chatId = currentUserId + userId;
    }
    usersChatID = chatId;
    console.log(chatId);
    //    ============================== user name and email
    const unsub = onSnapshot(doc(db, "userData", userId), (doc) => {
        console.log("Current data: ", doc.data());
        navbarName.innerHTML = doc.data().user_name;
        navbarImage.src = doc.data().photoUrl;
    });
    // ============================ get meassages 
    const q = query(collection(db, "messges"), where("usersChatID", "==", chatId), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            console.log(change.doc.data().current_user);
            if (change.type === "added") {

                if (change.doc.data().current_user === auth.currentUser.uid) {
                    console.log(change);
                    messageShow.innerHTML += `
                 <div class="flex justify-end mb-4">
                 <div class="mr-2 py-3 px-4 bg-blue-400 rounded-bl-3xl rounded-tl-3xl rounded-tr-xl text-white">
                 ${change.doc.data().user_message}
                 </div>
                 </div>
                 </div>
                 `
                } else {
                    messageShow.innerHTML += `
                <div class="flex justify-start mb-4">
                  <div class="ml-2 py-3 px-4 bg-gray-400 rounded-br-3xl rounded-tr-3xl rounded-tl-xl text-white">
                 ${change.doc.data().user_message}
                 </div>
                 </div>`
                }
            }
            console.log(change.doc.data());
        });
    });

    // ChatId = userId
}


// ==================== MESSAGE SEND INPUT ================== 

let messageInput = document.getElementById("message-input");

messageInput && messageInput.addEventListener("keypress", async () => {
    if (event.keyCode == "13") {
        console.log(usersChatID);
        console.log(auth.currentUser.uid);
        // Add a new document with a generated id.
        const docRef = await addDoc(collection(db, "messges"), {
            usersChatID,
            user_message: messageInput.value,
            current_user: auth.currentUser.uid,
            sender,
            timestamp: serverTimestamp()
        });
        console.log("Document written with ID: ", docRef.id);
        console.log(messageInput.value);
        messageInput.value = "";
    }
})

window.messages = messages;