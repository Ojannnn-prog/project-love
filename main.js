const introScreen = document.querySelector("#introScreen");
const mainContent = document.querySelector("#mainContent");
const openSurpriseBtn = document.querySelector("#openSurpriseBtn");
const musicPlayer = document.querySelector("#musicPlayer");
const loveAudio = document.querySelector("#loveAudio");
const playPauseBtn = document.querySelector("#playPauseBtn");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const progressBar = document.querySelector("#progressBar");
const currentTime = document.querySelector("#currentTime");
const durationTime = document.querySelector("#durationTime");
const songTitle = document.querySelector("#songTitle");
const songArtist = document.querySelector("#songArtist");
const playerMessage = document.querySelector("#playerMessage");

// STEP 2/3: src bisa memakai file lokal sementara atau URL Cloudinary secure_url.
const playlist = [
  {
    title: "How Deep Is Your Love",
    artist: "Bee Gees",
    src: "assets/music/Bee Gees - How Deep Is Your Love (Official Video) - beegees.mp3"
  },
  {
    title: "Say You Won't Let Go",
    artist: "James Arthur",
    src: "assets/music/James Arthur - Say You Won't Let Go - JamesAVEVO.mp3"
  },
  {
    title: "One Less Lonely Girl",
    artist: "Justin Bieber",
    src: "assets/music/Justin Bieber - One Less Lonely Girl - JustinBieberVEVO.mp3"
  },
  {
    title: "Back At One",
    artist: "Brian McKnight",
    src: "assets/music/Brian McKnight - Back At One (Short Version) (Official Music Video) - BrianMcKnightVEVO.mp3"
  }
];

let currentSongIndex = 0;
let isSeeking = false;

openSurpriseBtn.addEventListener("click", () => {
  introScreen.classList.add("is-hidden");
  mainContent.classList.add("is-visible");
});

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function loadSong(index) {
  const song = playlist[index];
  loveAudio.src = song.src;
  songTitle.textContent = song.title;
  songArtist.textContent = song.artist;
  progressBar.value = 0;
  currentTime.textContent = "0:00";
  durationTime.textContent = "0:00";
  playerMessage.textContent = "Tekan Play untuk mulai.";
  playPauseBtn.textContent = "Play";
  playPauseBtn.setAttribute("aria-label", "Putar lagu");
  musicPlayer.classList.remove("is-playing");
}

async function playSong() {
  try {
    await loveAudio.play();
    playPauseBtn.textContent = "Pause";
    playPauseBtn.setAttribute("aria-label", "Jeda lagu");
    musicPlayer.classList.add("is-playing");
    playerMessage.textContent = "Lagi diputar khusus buat kamu.";
  } catch (error) {
    playerMessage.textContent = "File musik belum ditemukan. Cek folder assets/music dan nama file di playlist.";
    musicPlayer.classList.remove("is-playing");
  }
}

function pauseSong() {
  loveAudio.pause();
  playPauseBtn.textContent = "Play";
  playPauseBtn.setAttribute("aria-label", "Putar lagu");
  musicPlayer.classList.remove("is-playing");
  playerMessage.textContent = "Lagu dijeda.";
}

function playNextSong() {
  currentSongIndex = (currentSongIndex + 1) % playlist.length;
  loadSong(currentSongIndex);
  playSong();
}

function playPreviousSong() {
  currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
  loadSong(currentSongIndex);
  playSong();
}

playPauseBtn.addEventListener("click", () => {
  if (loveAudio.paused) playSong();
  else pauseSong();
});

nextBtn.addEventListener("click", playNextSong);
prevBtn.addEventListener("click", playPreviousSong);

loveAudio.addEventListener("loadedmetadata", () => {
  durationTime.textContent = formatTime(loveAudio.duration);
});

loveAudio.addEventListener("timeupdate", () => {
  if (isSeeking || !loveAudio.duration) return;
  progressBar.value = (loveAudio.currentTime / loveAudio.duration) * 100;
  currentTime.textContent = formatTime(loveAudio.currentTime);
});

progressBar.addEventListener("input", () => {
  isSeeking = true;
  if (loveAudio.duration) {
    currentTime.textContent = formatTime((progressBar.value / 100) * loveAudio.duration);
  }
});

progressBar.addEventListener("change", () => {
  if (loveAudio.duration) {
    loveAudio.currentTime = (progressBar.value / 100) * loveAudio.duration;
  }
  isSeeking = false;
});

loveAudio.addEventListener("ended", playNextSong);
loveAudio.addEventListener("error", () => {
  playerMessage.textContent = "File musik belum ditemukan. Pastikan path lagunya benar.";
  musicPlayer.classList.remove("is-playing");
  playPauseBtn.textContent = "Play";
});

loadSong(currentSongIndex);

const galleryUploadForm = document.querySelector("#galleryUploadForm");
const galleryFileInput = document.querySelector("#galleryFileInput");
const galleryCaptionInput = document.querySelector("#galleryCaptionInput");
const galleryUploadBtn = document.querySelector("#galleryUploadBtn");
const galleryUploadStatus = document.querySelector("#galleryUploadStatus");
const selectedFileName = document.querySelector("#selectedFileName");
const galleryGrid = document.querySelector("#galleryGrid");
const galleryEmptyState = document.querySelector("#galleryEmptyState");

const wishlistForm = document.querySelector("#wishlistForm");
const wishlistInput = document.querySelector("#wishlistInput");
const wishlistSubmitBtn = document.querySelector("#wishlistSubmitBtn");
const wishlistStatus = document.querySelector("#wishlistStatus");
const wishlistGrid = document.querySelector("#wishlistGrid");
const wishlistEmptyState = document.querySelector("#wishlistEmptyState");

let galleryUnsubscribe = null;
let wishlistUnsubscribe = null;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  unsignedUploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  imageFolder: "love-gallery",
  musicFolder: "love-music"
};

function updateCloudStatus(type, message) {
  console.log(`[Cloud Status] ${type}: ${message}`);
}

function hasFirebaseConfig(config) {
  return Boolean(
    config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.appId
  );
}

function hasCloudinaryConfig(config) {
  return Boolean(config.cloudName && config.unsignedUploadPreset);
}

function getCloudinaryUploadUrl(resourceType = "image") {
  return `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`;
}

function initializeLoveCloudinary() {
  const isConfigured = hasCloudinaryConfig(cloudinaryConfig);

  window.loveCloudinary = {
    config: cloudinaryConfig,
    isConfigured,
    imageUploadUrl: isConfigured ? getCloudinaryUploadUrl("image") : "",
    audioUploadUrl: isConfigured ? getCloudinaryUploadUrl("video") : "",
    getUploadUrl: getCloudinaryUploadUrl
  };

  console.log(`[Cloudinary] Configured: ${isConfigured}`);

  return isConfigured;
}

async function initializeLoveFirebase() {
  try {
    if (!hasFirebaseConfig(firebaseConfig)) {
      window.loveFirebase = {
        app: null,
        db: null,
        isConfigured: false
      };
      console.log("[Firestore] Menunggu config");
      return false;
    }

    const [{ initializeApp }, firestore] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js")
    ]);

    const {
      addDoc,
      collection,
      getFirestore,
      onSnapshot,
      orderBy,
      query,
      serverTimestamp
    } = firestore;
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    window.loveFirebase = {
      app,
      db,
      firestore: {
        addDoc,
        collection,
        onSnapshot,
        orderBy,
        query,
        serverTimestamp
      },
      isConfigured: true
    };

    console.log(`[Firestore] Siap. Project ID: ${firebaseConfig.projectId}`);
    return true;
  } catch (error) {
    window.loveFirebase = {
      app: null,
      db: null,
      isConfigured: false,
      error
    };

    console.error("[Firestore] Error:", error);
    throw error;
  }
}

async function initializeCloudServices() {
  const isCloudinaryReady = initializeLoveCloudinary();

  try {
    const isFirestoreReady = await initializeLoveFirebase();

    if (isFirestoreReady && isCloudinaryReady) {
      updateCloudStatus("ready", "Firestore dan Cloudinary siap.");
      initializeGalleryFeature();
      initializeWishlistFeature();
      return;
    }

    if (isFirestoreReady) {
      updateCloudStatus("ready", "Firestore siap. Cloudinary menunggu config.");
      initializeGalleryFeature();
      initializeWishlistFeature();
      return;
    }

    updateCloudStatus("waiting", "Menunggu konfigurasi Firestore dan Cloudinary.");
  } catch (error) {
    updateCloudStatus("error", "Firestore gagal tersambung. Cek konfigurasi Firebase dan koneksi internet.");
  }
}

function setGalleryStatus(message, type = "info") {
  galleryUploadStatus.textContent = message;
  galleryUploadStatus.classList.toggle("text-red-500", type === "error");
  galleryUploadStatus.classList.toggle("text-green-600", type === "success");
  galleryUploadStatus.classList.toggle("text-pink-600", type === "info");
}

function setUploadBusy(isBusy) {
  galleryUploadBtn.disabled = isBusy;
  galleryUploadBtn.textContent = isBusy ? "Mengupload..." : "Upload Foto";
  galleryUploadBtn.classList.toggle("opacity-70", isBusy);
  galleryUploadBtn.classList.toggle("cursor-not-allowed", isBusy);
}

function createGalleryCard(photo) {
  const card = document.createElement("article");
  card.className = "gallery-card rounded-[1.5rem]";

  const image = document.createElement("img");
  image.src = photo.imageUrl;
  image.alt = photo.caption || "Foto kenangan romantis";
  image.loading = "lazy";

  const body = document.createElement("div");
  body.className = "p-4";

  const caption = document.createElement("p");
  caption.className = "text-2xl font-bold leading-8 text-pink-800";
  caption.textContent = photo.caption || "Kenangan manis tanpa caption";

  const meta = document.createElement("p");
  meta.className = "mt-2 text-lg font-bold text-pink-900/55";
  meta.textContent = photo.createdAt?.toDate
    ? photo.createdAt.toDate().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
    : "Baru saja";

  body.append(caption, meta);
  card.append(image, body);
  return card;
}

function renderGallery(snapshot) {
  galleryGrid.replaceChildren();
  galleryEmptyState.classList.toggle("hidden", !snapshot.empty);

  snapshot.forEach((doc) => {
    galleryGrid.append(createGalleryCard(doc.data()));
  });
}

function listenToGallery() {
  if (!window.loveFirebase?.isConfigured || galleryUnsubscribe) {
    return;
  }

  const { db, firestore } = window.loveFirebase;
  const galleryQuery = firestore.query(
    firestore.collection(db, "galleryPhotos"),
    firestore.orderBy("createdAt", "desc")
  );

  galleryUnsubscribe = firestore.onSnapshot(
    galleryQuery,
    renderGallery,
    () => {
      setGalleryStatus("Galeri gagal dibaca. Cek Firestore Rules untuk collection galleryPhotos.", "error");
    }
  );
}

async function uploadImageToCloudinary(file) {
  if (!window.loveCloudinary?.isConfigured) {
    throw new Error("Cloudinary belum dikonfigurasi.");
  }

  const { config, imageUploadUrl } = window.loveCloudinary;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", config.unsignedUploadPreset);
  formData.append("folder", config.imageFolder);

  const response = await fetch(imageUploadUrl, {
    method: "POST",
    body: formData
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "Upload Cloudinary gagal.");
  }

  return result;
}

async function savePhotoMetadata(uploadResult, caption) {
  if (!window.loveFirebase?.isConfigured) {
    throw new Error("Firestore belum siap.");
  }

  const { db, firestore } = window.loveFirebase;

  await firestore.addDoc(firestore.collection(db, "galleryPhotos"), {
    caption,
    imageUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    width: uploadResult.width || null,
    height: uploadResult.height || null,
    format: uploadResult.format || null,
    createdAt: firestore.serverTimestamp(),
    uploadedAtClient: new Date().toISOString()
  });
}

async function handleGalleryUpload(event) {
  event.preventDefault();

  const file = galleryFileInput.files?.[0];
  const caption = galleryCaptionInput.value.trim();

  if (!file) {
    setGalleryStatus("Pilih foto dulu ya.", "error");
    return;
  }

  if (!file.type.startsWith("image/")) {
    setGalleryStatus("File harus berupa gambar.", "error");
    return;
  }

  if (file.size > 8 * 1024 * 1024) {
    setGalleryStatus("Ukuran foto maksimal 8 MB.", "error");
    return;
  }

  try {
    setUploadBusy(true);
    setGalleryStatus("Mengupload foto ke Cloudinary...", "info");
    const uploadResult = await uploadImageToCloudinary(file);

    setGalleryStatus("Menyimpan data foto ke Firestore...", "info");
    await savePhotoMetadata(uploadResult, caption);

    galleryUploadForm.reset();
    selectedFileName.textContent = "Pilih foto romantis";
    setGalleryStatus("Foto berhasil masuk galeri.", "success");
  } catch (error) {
    setGalleryStatus(error.message || "Upload gagal. Coba cek Cloudinary preset dan Firestore Rules.", "error");
  } finally {
    setUploadBusy(false);
  }
}

function initializeGalleryFeature() {
  if (!galleryUploadForm) {
    return;
  }

  listenToGallery();

  galleryFileInput.addEventListener("change", () => {
    const file = galleryFileInput.files?.[0];
    selectedFileName.textContent = file ? file.name : "Pilih foto romantis";
  });

  galleryUploadForm.addEventListener("submit", handleGalleryUpload);
}

function setWishlistStatus(message, type = "info") {
  wishlistStatus.textContent = message;
  wishlistStatus.classList.remove("hidden");
  wishlistStatus.classList.toggle("text-red-500", type === "error");
  wishlistStatus.classList.toggle("text-green-600", type === "success");
  wishlistStatus.classList.toggle("text-pink-600", type === "info");
  
  if (type === "success") {
    setTimeout(() => wishlistStatus.classList.add("hidden"), 3000);
  }
}

function createWishlistCard(wish, docId) {
  const card = document.createElement("article");
  card.className = "wishlist-card flex items-center justify-between rounded-[1.5rem] p-5";
  
  const content = document.createElement("div");
  content.className = "flex items-start gap-4";
  
  const icon = document.createElement("span");
  icon.className = "text-3xl";
  icon.innerHTML = "&#10024;"; // sparkle emoji
  
  const textContainer = document.createElement("div");
  
  const title = document.createElement("p");
  title.className = "text-2xl font-bold text-pink-800";
  title.textContent = wish.text;
  
  const meta = document.createElement("p");
  meta.className = "mt-1 text-lg font-bold text-pink-900/55";
  meta.textContent = wish.createdAt?.toDate
    ? wish.createdAt.toDate().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
    : "Baru saja";
    
  textContainer.append(title, meta);
  content.append(icon, textContainer);
  card.append(content);
  
  return card;
}

function renderWishlist(snapshot) {
  wishlistGrid.replaceChildren();
  wishlistEmptyState.classList.toggle("hidden", !snapshot.empty);

  snapshot.forEach((doc) => {
    wishlistGrid.append(createWishlistCard(doc.data(), doc.id));
  });
}

function listenToWishlist() {
  if (!window.loveFirebase?.isConfigured || wishlistUnsubscribe) {
    return;
  }

  const { db, firestore } = window.loveFirebase;
  const wishlistQuery = firestore.query(
    firestore.collection(db, "wishlist"),
    firestore.orderBy("createdAt", "desc")
  );

  wishlistUnsubscribe = firestore.onSnapshot(
    wishlistQuery,
    renderWishlist,
    () => {
      setWishlistStatus("Wishlist gagal dibaca. Cek Firestore Rules.", "error");
    }
  );
}

async function handleWishlistSubmit(event) {
  event.preventDefault();
  
  const text = wishlistInput.value.trim();
  if (!text) return;
  
  if (!window.loveFirebase?.isConfigured) {
    setWishlistStatus("Firestore belum siap.", "error");
    return;
  }
  
  try {
    wishlistSubmitBtn.disabled = true;
    wishlistSubmitBtn.textContent = "Menyimpan...";
    
    const { db, firestore } = window.loveFirebase;
    await firestore.addDoc(firestore.collection(db, "wishlist"), {
      text,
      isCompleted: false,
      createdAt: firestore.serverTimestamp()
    });
    
    wishlistForm.reset();
    setWishlistStatus("Mimpi baru berhasil ditambahkan!", "success");
  } catch (error) {
    setWishlistStatus("Gagal menyimpan wishlist.", "error");
  } finally {
    wishlistSubmitBtn.disabled = false;
    wishlistSubmitBtn.textContent = "Tambah Wishlist";
  }
}

function initializeWishlistFeature() {
  if (!wishlistForm) return;
  
  listenToWishlist();
  wishlistForm.addEventListener("submit", handleWishlistSubmit);
}

function initializeSmoothScrollReveal() {
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".glass-panel").forEach(el => {
    el.classList.add("reveal");
    observer.observe(el);
  });
}

initializeCloudServices();
initializeSmoothScrollReveal();
