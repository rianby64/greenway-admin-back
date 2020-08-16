
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
  const routesRef = await db.collection('routes').get();
  const routes = await Promise.all(routesRef.docs.map(async routeRef => {
    const categoriesRef = await routeRef.get('categories') as FirebaseFirestore.DocumentReference[];
    const dotsRef = await routeRef.get('dots') as FirebaseFirestore.DocumentReference[];
    const images = await routeRef.get('images') as String[];
    const lines = await routeRef.get('lines') as FirebaseFirestore.GeoPoint[];
    const typesRef = await routeRef.get('types') as FirebaseFirestore.DocumentReference[];
    const difficultyRef = await routeRef.get('difficulty') as FirebaseFirestore.DocumentReference;

    return {
      id: routeRef.id,
      animals: routeRef.get('animals') as Boolean,
      approved: routeRef.get('approved') as Boolean,
      categories: categoriesRef ? await Promise.all(categoriesRef.map(async categoryRef => {
        const category = await categoryRef.get();
        return {
          [categoryRef.id]: {
            title: category.get('title') as String
          }
        };
      })) : [],
      children: routeRef.get('children') as Boolean,
      description: routeRef.get('description') as String,
      difficulty: difficultyRef ? {
        [difficultyRef.id]: {
          title: (await difficultyRef.get()).get('title') as String
        }
      } : {},
      disabilities: routeRef.get('disabilities') as Boolean,
      dots: dotsRef ? await Promise.all(dotsRef.map(async dotRef => {
        const dot = await dotRef.get();
        const pos = dot.get('position') as FirebaseFirestore.GeoPoint;
        const dottypeRef = await dot.get('type') as FirebaseFirestore.DocumentReference;
        let dottypeId = '';
        let dottypeTitle = '';
        if (dottypeRef) {
          const dottype = await dottypeRef.get();
          dottypeId = dottype.id;
          dottypeTitle = dottype.get('title');
        }
        return {
          id: dotRef.id,
          description: await dot.get('description'),
          position: {
            latitude: pos.latitude,
            longitude: pos.longitude,
          },
          type: dottypeId,
          title: dottypeTitle
        };
      })) : [],
      images,
      lines: lines.map(line => {
        return { latitude: line.latitude, longitude: line.longitude }
      }),
      distance: routeRef.get('distance') as Number,
      minutes: routeRef.get('minutes') as Number,
      title: routeRef.get('title') as String,
      types: typesRef ? await Promise.all(typesRef.map(async typeRef => {
        const type = await typeRef.get();
        return {
          [typeRef.id]: {
            title: type.get('title') as String
          }
        }
      })) : []
    };
  }));

  return routes;
}

app.get('/api/routes', async function(req, res) {
  try {
    const routes = await getRoutes(db);
    res.json(routes);
  } catch(e) {
    res.status(500).json(e); // THIS IS AN ERROR!!! MAKE SURE YOU WONT EXPOSE SENSTIVE INFO HERE
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
    res.status(500).json(e); // THIS IS AN ERROR!!! MAKE SURE YOU WONT EXPOSE SENSTIVE INFO HERE
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
    distance: number;
    minutes: number;
    title: string;
    description: string;
  };

  delete data.id;

  try {
    await db.collection('routes').doc(id).update(data);
    res.json({
      success: true,
    });
  } catch(e) {
    res.status(500).json(e);
  }
});

app.post('/api/routes', async function(req, res) {
  const id = req.params.id;
  const data = req.body as {
    id: string;
    animals: boolean;
    approved: boolean;
    children: boolean;
    disabilities: boolean;
    distance: number;
    minutes: number;
    title: string;
    description: string;
  };

  delete data.id;

  try {
    await db.collection('routes').doc().create(data);
    res.json({
      success: true,
    });
  } catch(e) {
    res.status(500).json(e);
  }
});

app.put('/api/routes/:id/dots', async function(req, res) {
  const id = req.params.id;
  const routeRef = await db.collection('routes').doc(id).get();
  const dotRefs = await routeRef.get('dots') as FirebaseFirestore.DocumentReference[];

  const dotsFromRequest = req.body as {
     [id: string]: {
      id: string;
      description: string;
      position: {
        latitude:number;
        longitude:number;
      };
      title: string;
      type: string;
    }
  };

  try {
    await Promise.all(dotRefs.map((dotRef) => {
      const dot = dotsFromRequest[dotRef.id];
      if (dot) {
        return dotRef.update({
          position: new firestore.GeoPoint(dot.position.latitude, dot.position.longitude),
          description: dot.description,
        });
      }
    }));

    res.json({
      success: true,
    });
  } catch(e) {
    res.status(500).json(e); // THIS IS AN ERROR!!! MAKE SURE YOU WONT EXPOSE SENSTIVE INFO HERE
  }
});


app.listen(3000);
