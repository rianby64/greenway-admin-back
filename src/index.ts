
import express from 'express';
import bodyParser from 'body-parser';
import * as admin from "firebase-admin";

const app = express();
app.use(express.static('./static'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());


admin.initializeApp({
  credential: admin.credential.cert('./firebase-key.json'),
  databaseURL: "https://thegreenway-f50d0.firebaseio.com",
});

const db = admin.firestore();

async function getRoutes(db: FirebaseFirestore.Firestore) {
  const routesRef = await db.collection('routes').get();
  const routes = await Promise.all(routesRef.docs.map(async routeRef => {
    const categoriesRef = routeRef.get('categories') as FirebaseFirestore.DocumentReference[];
    const categories = await Promise.all(categoriesRef.map(async categoryRef => {
      const category = await categoryRef.get();
      return {
        [categoryRef.id]: {
          [category.id]: category.get('title') as String
        }
      };
    }));

    const dotsRef = routeRef.get('dots') as FirebaseFirestore.DocumentReference[];
    const dots = await Promise.all(dotsRef.map(async dotRef => {
      const dot = await dotRef.get();
      const pos = dot.get('position') as FirebaseFirestore.GeoPoint;
      return {
        [dotRef.id]: {
          latitude: pos.latitude,
          longitude: pos.longitude,
        }
      }
    }));

    const images = await routeRef.get('images') as String[];
    const lines = await routeRef.get('lines') as FirebaseFirestore.GeoPoint[];

    const typesRef = routeRef.get('types') as FirebaseFirestore.DocumentReference[];
    const types = await Promise.all(typesRef.map(async typeRef => {
      const type = await typeRef.get();
      return {
        [typeRef.id]: {
          title: type.get('title') as String
        }
      }
    }));

    const difficultyRef = routeRef.get('difficulty') as FirebaseFirestore.DocumentReference;
    const difficulty = await difficultyRef.get();

    return {
      id: routeRef.id,
      animals: routeRef.get('animals') as Boolean,
      approved: routeRef.get('approved') as Boolean,
      categories,
      children: routeRef.get('children') as Boolean,
      description: routeRef.get('description') as String,
      difficulty: {
        [difficultyRef.id]: {
          title: difficulty.get('title') as String
        }
      },
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
  const routes = await getRoutes(db);
  res.json(routes);
});

app.put('/api/routes/:id/lines', async function(req, res) {
  const id = req.params.id;
  const lines = req.body;
  console.log(id, lines);
});

app.listen(3000);
