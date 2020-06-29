
import express from 'express';
import bodyParser from 'body-parser';
import { initializeApp, credential, firestore } from "firebase-admin";

const app = express();
app.use(express.static('./static'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());


initializeApp({
  credential: credential.cert('./firebase-key.json'),
  databaseURL: "https://thegreenway-f50d0.firebaseio.com",
});

const db = firestore();

async function getRoutes(db: FirebaseFirestore.Firestore) {
  let categories: {
    [x: string]: {
      [x: string]: String;
    };
  }[]
  let dots: {
    [key: string]: {
      latitude: number;
      longitude: number;
    };
  }[];
  let types: {
    [key: string]: {
      title: String;
    };
  }[];
  let difficulty: {
    [key: string]: {
      title: String;
    };
  };

  const routesRef = await db.collection('routes').get();
  const routes = await Promise.all(routesRef.docs.map(async routeRef => {
    const categoriesRef = routeRef.get('categories') as FirebaseFirestore.DocumentReference[];
    if (categoriesRef) {
      categories = await Promise.all(categoriesRef.map(async categoryRef => {
        const category = await categoryRef.get();
        return {
          [categoryRef.id]: {
            [category.id]: category.get('title') as String
          }
        };
      }));
    }

    const dotsRef = routeRef.get('dots') as FirebaseFirestore.DocumentReference[];
    if (dotsRef) {
      dots = await Promise.all(dotsRef.map(async dotRef => {
        const dot = await dotRef.get();
        const pos = dot.get('position') as FirebaseFirestore.GeoPoint;
        return {
          [dotRef.id]: {
            latitude: pos.latitude,
            longitude: pos.longitude,
          }
        }
      }));
    }

    const images = await routeRef.get('images') as String[];
    const lines = await routeRef.get('lines') as FirebaseFirestore.GeoPoint[];

    const typesRef = routeRef.get('types') as FirebaseFirestore.DocumentReference[];
    if (typesRef) {
      types = await Promise.all(typesRef.map(async typeRef => {
        const type = await typeRef.get();
        return {
          [typeRef.id]: {
            title: type.get('title') as String
          }
        }
      }));
    }

    const difficultyRef = routeRef.get('difficulty') as FirebaseFirestore.DocumentReference;
    if (difficultyRef) {
      difficulty = {
        [difficultyRef.id]: {
          title: (await difficultyRef.get()).get('title') as String
        }
      }
    }

    return {
      id: routeRef.id,
      animals: routeRef.get('animals') as Boolean,
      approved: routeRef.get('approved') as Boolean,
      categories,
      children: routeRef.get('children') as Boolean,
      description: routeRef.get('description') as String,
      difficulty,
      disabilities: routeRef.get('disabilities') as Boolean,
      dots,
      images,
      lines: lines.map(line => {
        return { latitude: line.latitude, longitude: line.longitude }
      }),
      minutes: routeRef.get('minutes') as Number,
      title: routeRef.get('title') as String,
      types
    };
  }));

  return routes;
}

app.get('/api/routes', async function(req, res) {
  try {
    const routes = await getRoutes(db);
    res.json(routes);
  } catch(e) {
    res.json(e); // THIS IS AN ERROR!!! MAKE SURE YOU WONT EXPOSE SENSTIVE INFO HERE
  }
});

app.put('/api/routes/:id/lines', async function(req, res) {
  const id = req.params.id;
  const lines = (req.body as {latitude:number, longitude:number}[]).map(line => {
    return new firestore.GeoPoint(line.latitude, line.longitude);
  });

  try {
    await db.collection('routes').doc(id).update({ lines: lines });
    res.json({
      success: true,
    });
  } catch(e) {
    res.json(e); // THIS IS AN ERROR!!! MAKE SURE YOU WONT EXPOSE SENSTIVE INFO HERE
  }
});


app.put('/api/routes/:id', async function(req, res) {
  const id = req.params.id;
  const data = req.body as {
    id: string;
    animals: boolean;
    approved: boolean;
    children: boolean;
    disabilities: boolean;
    minutes: number;
    title: string;
    description: string;
  };

  try {
    await db.collection('routes').doc(id).update(data);
    res.json({
      success: true,
    });
  } catch(e) {
    res.status(500).json(e);
  }

});

app.listen(3000);
