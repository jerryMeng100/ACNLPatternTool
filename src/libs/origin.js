// api
import axios from "axios";
const { API_URL } = process.env;
import firebase from "firebase";
import md5 from "md5"

//Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyCHjy1cDN6_eVBU0ylpF1KqAlesUyP6j-I",
    authDomain: "fashion-crossing.firebaseapp.com",
    databaseURL: "https://fashion-crossing.firebaseio.com",
    projectId: "fashion-crossing",
    storageBucket: "fashion-crossing.appspot.com",
    messagingSenderId: "5433173188",
    appId: "1:5433173188:web:e7f4a109ce70aca3cd9591",
    measurementId: "G-N1Y6T01NDB"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();
var db = firebase.firestore()

const api = (() => {
  return axios.create({
    baseURL: `${API_URL}`,
  timeout: 10000,
});
})();
// 'get' api method helper
const encodeQueryParams = (params) => {
  const keys = Object.keys(params);
  if (keys.length === 0) return "";
  return Object.keys(params).reduce((accum, curr, index) => {
    let query = accum;
    let param = curr;
    let value = params[curr]
    if (index > 0) query += "&";
    const encodedParam = encodeURIComponent(param);
    const encodedValue = encodeURIComponent(value);
    return query + `${encodedParam}=${encodedValue}`;
  }, "?");
};

//Upload
const upload = async (pattData, styleA, styleB, styleC, typeA, typeB, typeC, NSFW) => {
  const response = await api.post('api.php', {
    pattern:pattData,
    styletag_a:styleA,
    styletag_b:styleB,
    styletag_c:styleC,
    typetag_a:typeA,
    typetag_b:typeB,
    typetag_c:typeC,
    nokids:(NSFW?"Y":"")
  });
  return response.data;
};

//NEW VERSION OF UPLOAD: UNFINISHED
// const upload = async (pattData, styleA, styleB, styleC, typeA, typeB, typeC, NSFW) => {
//   const hash = md5(pattData)
//   return db.collection("patterns").doc(hash).set(
//     {
//         pattern:pattData,
//         styletag_a:styleA,
//         styletag_b:styleB,
//         styletag_c:styleC,
//         typetag_a:typeA,
//         typetag_b:typeB,
//         typetag_c:typeC,
//         nokids:(NSFW?"Y":"")
//     }
//   ).then(function() {
//       console.log("Document successfully written!");
//       return {"upload":hash}
//   })
//   .catch(function(error) {
//       console.error("Error writing document: ", error);
//       return {"error":"cannot write"}
//   });
// }


// Search
const search = async (q, options) => {
  const { nsfc, unapproved: letsgetdangerous } = options;
  const params = encodeQueryParams({
    q,
    nsfc: Number(nsfc),
    letsgetdangerous: Number(letsgetdangerous),
  });
  const response = await api.get(`api.php${params}`);
  return response.data;
};

// // Open single pattern
const view = async (hash) => {
  const response = await api.get(`api.php${encodeQueryParams({view: hash})}`);
  console.log("Document data:", response.data);
  return response.data;
};

//8549fe81ea6fb5acbea2f7530c4a14a9

//NEW VERSION OF VIEW
// const view = async (hash) => {
//   return db.collection("patterns").doc(hash).get().then(function(doc) {
//     if (doc.exists) {
//         console.log("Document data:", doc.data().bytes);
//         return doc.data().bytes;
//     } else {
//         // doc.data() will be undefined in this case
//         console.log("No such document!");
//         return ""
//     }
// }).catch(function(error) {
//     console.log("Error getting document:", error);
//     return ""
// });
//
// }

// Recent uploads
const recent = async (options) => {
  const { nsfc, unapproved: letsgetdangerous } = options;
  const params = encodeQueryParams({
    recent: 1,
    nsfc: Number(nsfc),
    letsgetdangerous: Number(letsgetdangerous),
  });
  const response = await api.get(`api.php${params}`);
  return response.data;
};

const modLogIn = async (username, password) => {
  try {
    const response = await api.post("api.php", {
      user: username,
      pass: password
    });
    if (response.data.error){
      throw new Error(response.data.error);
      return "";
    }
    return response.data.token;
  }
  catch (error) {
    if (error.response.status !== 401) throw error;
    return "";
  }
};

const modPending = async (token) => {
  const response = await api.get(`api.php${encodeQueryParams({modqueue: 1, token})}`);
  return response.data;
};

const modApprove = async (hash, options, token) => {
  const response = await api.post("api.php", {
    ...options,
    approve: hash,
    token,
  });
  return response.data;
};

// exporting as delete, delete is a keyword :(
const modDelete = async (hash, token) => {
  const response = await api.post("api.php", {
    wipepattern: hash,
    token: token
  });
  return response.data;
};


const tags_style = [
  'Natural',
  'Cute',
  'Sporty',
  'Cool',
  'Rustic',
  'Hip',
  'Harmonious',
  'Elegant',
  'Modern',
  'Historical',
  'Civic',
  'Silly',
  'Spooky',
  'Sci-Fi',
  'Aquatic',
  'Floral',
  'Animal',
  'Holiday',
  'Food',
  'Brand',
  'Video Game',
  'Anime',
  'Meme'
];

const tags_type = [
  'Path',
  'Clothing',
  'Hat',
  'Wallpaper',
  'Carpet',
  'Furniture',
  'Flag',
  'Sign',
  'Logo',
  'Poster'
];

export default {
  upload,
  search,
  recent,
  view,
  modLogIn,
  modPending,
  modApprove,
  modDelete,
  tags_style,
  tags_type
};
