
import * as admin from "firebase-admin";

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
      return {
        [dotRef.id]: dot.get('position') as FirebaseFirestore.GeoPoint
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
      lines,
      minutes: routeRef.get('minutes') as Number,
      title: routeRef.get('title') as String,
      types
    };
  }));

  return routes;
}

const routes = getRoutes(db).then(routes => console.log(routes));
