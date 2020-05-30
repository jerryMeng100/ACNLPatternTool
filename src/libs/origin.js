// api
import axios from "axios";
const { API_URL } = process.env;
import firebase from "firebase";
import md5 from "md5"
import ACNLFormat from './ACNLFormat';
import lzString from 'lz-string';

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
// const upload = async (pattData, styleA, styleB, styleC, typeA, typeB, typeC, NSFW) => {
//   const response = await api.post('api.php', {
//     pattern:pattData,
//     styletag_a:styleA,
//     styletag_b:styleB,
//     styletag_c:styleC,
//     typetag_a:typeA,
//     typetag_b:typeB,
//     typetag_c:typeC,
//     nokids:(NSFW?"Y":"")
//   });
//   return response.data;
// };

// const create_pattern = (pattData, styleA, styleB, styleC, typeA, typeB, typeC, NSFW) => {
//   //the thing we return to load (what is fetched in bytes by view) is a base64 version of ACNL.
//   //load takes a string with "B6|" in front and calls atob on it.
//   //upload is handed a ACNL with btoa called on it.
//   //we might just simply need to append the type.
//   var newPatternObject = ACNLFormat(pattData);
// }
//NEW VERSION OF UPLOAD: UNFINISHED
const upload = async (pattData, styleA, styleB, styleC, typeA, typeB, typeC, NSFW) => {
  const hash = md5(pattData)
  const pattern_string = "B6|" + pattData
  const url = "/editor#H:" + hash
  const patternObj = new ACNLFormat(atob(pattData));
  const title = patternObj.title;
  const author = patternObj.creator[0];
  const town = patternObj.town[0];
  const upload_date = Date.now()
  //bytes
  //title
  //url
  //author
  //town
  return db.collection("patterns").doc(hash).set(
    {
        bytes:pattern_string,
        url:url,
        title:title,
        author:author,
        town:town,
        upload_date:firebase.firestore.Timestamp.fromDate(new Date()),
        styletag_a:styleA,
        styletag_b:styleB,
        styletag_c:styleC,
        typetag_a:typeA,
        typetag_b:typeB,
        typetag_c:typeC,
        likes:[],
        nokids:(NSFW?"Y":"")
    }
  ).then(function() {
      console.log("Document successfully written!");
      return {"upload":hash}
  })
  .catch(function(error) {
      console.error("Error writing document: ", error);
      return {"error":"cannot write"}
  });
}


// Search
// const search = async (q, options) => {
//   const { nsfc, unapproved: letsgetdangerous } = options;
//   const params = encodeQueryParams({
//     q,
//     nsfc: Number(nsfc),
//     letsgetdangerous: Number(letsgetdangerous),
//   });
//   const response = await api.get(`api.php${params}`);
//   return response.data;
// };

// // Open single pattern
// const view = async (hash) => {
//   const response = await api.get(`api.php${encodeQueryParams({view: hash})}`);
//   console.log("Document data:", response.data);
//   return response.data;
// };
const search = async (query, options) => {
  return db.collection("patterns").get().then(function(querySnapshot) {
    var all_results = []
    querySnapshot.forEach(function(doc) {
        const data = doc.data()
        //check title, author, or town.
        if(data.town.toLowerCase().includes(query.toLowerCase()) ||
           data.title.toLowerCase().includes(query.toLowerCase()) ||
           data.author.toLowerCase().includes(query.toLowerCase())){
          all_results.push(doc.data())
        }
        //in future, check tags as well!

        // doc.data() is never undefined for query doc snapshots
        //data must contain:
          //bytes
          //title
          //url
          //author
          //town
        //console.log(doc.id, " => ", doc.data());
    });
    return all_results;
  });
}


//8549fe81ea6fb5acbea2f7530c4a14a9

//NEW VERSION OF VIEW
const view = async (hash) => {
  return db.collection("patterns").doc(hash).get().then(function(doc) {
    if (doc.exists) {
        console.log("Document data:", doc.data().bytes);
        return doc.data().bytes;
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
        return ""
    }
}).catch(function(error) {
    console.log("Error getting document:", error);
    return ""
});

}

// Recent uploads
// const recent = async (options) => {
//   const { nsfc, unapproved: letsgetdangerous } = options;
//   const params = encodeQueryParams({
//     recent: 1,
//     nsfc: Number(nsfc),
//     letsgetdangerous: Number(letsgetdangerous),
//   });
//   const response = await api.get(`api.php${params}`);
//   return response.data;
// };

const recent = async (options) => {
  return db.collection("patterns").orderBy("upload_date", "desc").get().then(function(querySnapshot) {
    var all_results = []
    querySnapshot.forEach(function(doc) {
        all_results.push(doc.data())
        // doc.data() is never undefined for query doc snapshots
        //data must contain:
          //bytes
          //title
          //url
          //author
          //town
        //console.log(doc.id, " => ", doc.data());
    });
    return all_results;
  });
}


const getLikes = async (hash) => {
  return db.collection("patterns").doc(hash).get().then(function(doc) {
    if (doc.exists) {
        console.log("Document data:", doc.data().likes);
        return doc.data().likes;
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
        return ""
    }
  }).catch(function(error) {
    console.log("Error getting document:", error);
    return ""
  });
}

const toggleLike = async (hash, ip, likes) => {
  // console.log("toggleLike");
  // console.log(ip);
  // console.log(likes);
  if(likes.includes(ip)){
// Atomically remove a region from the "regions" array field.
  return db.collection("patterns").doc(hash).update({
   likes: firebase.firestore.FieldValue.arrayRemove(ip)
    });
  } else {
    return db.collection("patterns").doc(hash).update({
   likes: firebase.firestore.FieldValue.arrayUnion(ip)
    });
  }
}

const getIP = async () => {
  return fetch('https://api.ipify.org?format=json')
  .then(x => x.json())
  .then(({ ip }) => {
      console.log(ip);
      return ip;
  });
}
// const modLogIn = async (username, password) => {
//   try {
//     const response = await api.post("api.php", {
//       user: username,
//       pass: password
//     });
//     if (response.data.error){
//       throw new Error(response.data.error);
//       return "";
//     }
//     return response.data.token;
//   }
//   catch (error) {
//     if (error.response.status !== 401) throw error;
//     return "";
//   }
// };

// const modPending = async (token) => {
//   const response = await api.get(`api.php${encodeQueryParams({modqueue: 1, token})}`);
//   return response.data;
// };

// const modApprove = async (hash, options, token) => {
//   const response = await api.post("api.php", {
//     ...options,
//     approve: hash,
//     token,
//   });
//   return response.data;
// };

// exporting as delete, delete is a keyword :(
// const modDelete = async (hash, token) => {
//   const response = await api.post("api.php", {
//     wipepattern: hash,
//     token: token
//   });
//   return response.data;
// };


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
  toggleLike,
  getLikes,
  getIP,
  // modLogIn,
  // modPending,
  // modApprove,
  // modDelete,
  tags_style,
  tags_type
};
