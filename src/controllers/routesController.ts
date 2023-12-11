import { initializeApp, credential, firestore } from 'firebase-admin';
const { clearImageArray, creatorManger } = require("../utils/utils")
const { getRoutes, getRoutesByUserId } = require("../services/routesService");

const db = firestore();


const getAllRoutesController = async function (req: any, res: any) {
  try {
		if (req.user.roleId === 1) {
			const routes = await getRoutes(db);
			res.json(routes);
		}
		else {
			const routes = await getRoutesByUserId(db, req.user.id);
			res.json(routes);
		}


  } catch (e) {
    res.status(500).json(e); // THIS IS AN ERROR!!! MAKE SURE YOU WONT EXPOSE SENSTIVE INFO HERE
  }
};

const getAllRoutesUsersController = async function (req: any, res: any) {
  try {
    const routes = await getRoutes(db, true);
    res.json(routes);
  } catch (e) {
    res.status(500).json(e); // THIS IS AN ERROR!!! MAKE SURE YOU WONT EXPOSE SENSTIVE INFO HERE
  }
};

const updateLineByRouteIdController = async function (req: any, res: any) {
  const id = req.params.id;
  const lines = (req.body /*as { lat: number; lng: number }[]*/).map((line: any) => {
    return new firestore.GeoPoint(line.lat, line.lng);
  });
  try {
    await db.collection('routes').doc(id).update({ lines: lines });
    res.json({
      success: true,
    });
  } catch (e) {
    res.status(500).json(e); // THIS IS AN ERROR!!! MAKE SURE YOU WONT EXPOSE SENSTIVE INFO HERE
  }
};

const updateLinesByUserIdController = async function (req: any, res: any) {
  const id = req.params.id;
  const lines = (req.body /*as { lat: number; lng: number }[]*/).map((line: any) => {
    return new firestore.GeoPoint(line.lat, line.lng);
  });
  try {
    await db.collection('users_routes').doc(id).update({ lines: lines });
    res.json({
      success: true,
    });
  } catch (e) {
    res.status(500).json(e); // THIS IS AN ERROR!!! MAKE SURE YOU WONT EXPOSE SENSTIVE INFO HERE
  }
};

const updateRouteByIdController = async function (req: any, res: any) {
  console.log(req.body);
  const id = req.params.id;
  const routeTypesRefs = await db.collection('travel_types').get();
  const routeCategoriesRefs = await db.collection('categories').get();
  const routeDifficultyRefs = await db.collection('difficulties').get();
  const districtsRefs = await db.collection('districts').get();
	const authorsRefs = await db.collection('users').get();

  let difficultyRef: firestore.DocumentData = firestore.DocumentReference;
  routeDifficultyRefs.docs.map((el) => {
    if (el.id === req.body.difficulty) {
      difficultyRef = el.ref;
    }
  });

  let arrayOfCategoriesRef: Array<firestore.DocumentData> = [];
  req.body.categories.map((el: any) => {
    routeCategoriesRefs.docs.map((elToFind) => {
      if (elToFind.id === el) {
        arrayOfCategoriesRef.push(elToFind.ref);
      }
    });
  });

  let arrayOfDistrictsRef: Array<firestore.DocumentData> = [];
  req.body.districts.map((el: any) => {
    districtsRefs.docs.map((elToFind) => {
      if (elToFind.id === el) {
        arrayOfDistrictsRef.push(elToFind.ref);
      }
    });
  });

  let arrayOfTypeRef: Array<firestore.DocumentData> = [];
  req.body.type.map((el: any) => {
    routeTypesRefs.docs.map((elToFind) => {
      if (elToFind.id === el) {
        arrayOfTypeRef.push(elToFind.ref);
      }
    });
  });

	let authorRef: firestore.DocumentData = firestore.DocumentReference;
  authorsRefs.docs.map((el) => {
    if (el.id === req.body.author.id) {
      authorRef = el.ref;
    }
  });

  let ObjectOfDurations: any = {};
  req.body.durations.forEach((el: any) => {
    ObjectOfDurations[el.name] = parseInt(el.number);
  });

  const rowToUpdate: {
    id?: string;
    animals?: boolean;
    approved?: boolean;
    children?: boolean;
    wheelchair?: boolean;
    visuallyImpaired?: boolean;
    distance?: number;
    minutes?: number;
    title?: string;
    description?: string;
    types?: Array<firestore.DocumentData>;
    categories?: Array<firestore.DocumentData>;
    districts?: Array<firestore.DocumentData>;
    durations?: Object;
    difficulty?: firestore.DocumentData;
    images?: Array<any>,
    creator?: any,
		author?: firestore.DocumentData
  } = {
    animals: !!req.body.animals,
    approved: !!req.body.approved,
    children: !!req.body.children,
    wheelchair: !!req.body.wheelChair,
    visuallyImpaired: !!req.body.visuallyImpaired,
    distance: Number(req.body.distance),
    minutes: Number(req.body.minutes),
    title: req.body.title,
    description: req.body.description,
    types: arrayOfTypeRef,
    categories: arrayOfCategoriesRef,
    districts: arrayOfDistrictsRef,
    durations: ObjectOfDurations,
    difficulty: difficultyRef,
    images: clearImageArray(req.body.images),
    creator: creatorManger(req.body.creator),
		author: authorRef
  };
  delete rowToUpdate.id;

  try {
    await db.collection('routes').doc(id).update(rowToUpdate);
    res.json({
      success: true,
    });
  } catch (e) {
    res.status(500).json(e);
  }
};

const updateRouteByUserIdController = async function (req: any, res: any) {
  console.log(req.body);
  const id = req.params.id;
  const routeTypesRefs = await db.collection('travel_types').get();
  const routeCategoriesRefs = await db.collection('categories').get();
  const routeDifficultyRefs = await db.collection('difficulties').get();
  const districtsRefs = await db.collection('districts').get();
  let difficultyRef: firestore.DocumentData = firestore.DocumentReference;
  routeDifficultyRefs.docs.map((el) => {
    if (el.id === req.body.difficulty) {
      difficultyRef = el.ref;
    }
  });

  let arrayOfCategoriesRef: Array<firestore.DocumentData> = [];
  req.body.categories.map((el: any) => {
    routeCategoriesRefs.docs.map((elToFind) => {
      if (elToFind.id === el) {
        arrayOfCategoriesRef.push(elToFind.ref);
      }
    });
  });

  let arrayOfDistrictsRef: Array<firestore.DocumentData> = [];
  req.body.districts.map((el: any) => {
    districtsRefs.docs.map((elToFind) => {
      if (elToFind.id === el) {
        arrayOfDistrictsRef.push(elToFind.ref);
      }
    });
  });

  let arrayOfTypeRef: Array<firestore.DocumentData> = [];
  req.body.type.map((el: any) => {
    routeTypesRefs.docs.map((elToFind) => {
      if (elToFind.id === el) {
        arrayOfTypeRef.push(elToFind.ref);
      }
    });
  });

  let ObjectOfDurations: any = {};
  req.body.durations.forEach((el: any) => {
    ObjectOfDurations[el.name] = parseInt(el.number);
  });

  const rowToUpdate: {
    id?: string;
    animals?: boolean;
    approved?: boolean;
    children?: boolean;
    wheelchair?: boolean;
    visuallyImpaired?: boolean;
    distance?: number;
    minutes?: number;
    title?: string;
    description?: string;
    types?: Array<firestore.DocumentData>;
    categories?: Array<firestore.DocumentData>;
    districts?: Array<firestore.DocumentData>;
    durations?: Object;
    difficulty?: firestore.DocumentData;
    images?: Array<any>,
    creator?: any
  } = {
    animals: !!req.body.animals,
    approved: !!req.body.approved,
    children: !!req.body.children,
    wheelchair: !!req.body.wheelChair,
    visuallyImpaired: !!req.body.visuallyImpaired,
    distance: Number(req.body.distance),
    minutes: Number(req.body.minutes),
    title: req.body.title,
    description: req.body.description,
    types: arrayOfTypeRef,
    categories: arrayOfCategoriesRef,
    districts: arrayOfDistrictsRef,
    durations: ObjectOfDurations,
    difficulty: difficultyRef,
    images: clearImageArray(req.body.images),
    creator: creatorManger(req.body.creator)
  };
  delete rowToUpdate.id;

  try {
    await db.collection('users_routes').doc(id).update(rowToUpdate);
    res.json({
      success: true,
    });
  } catch (e) {
    res.status(500).json(e);
  }
};

const createRouteController = async function (req: any, res: any) {
  console.log(req.body);
  const routeTypesRefs = await db.collection('travel_types').get();
  const routeCategoriesRefs = await db.collection('categories').get();
  const routeDifficultyRefs = await db.collection('difficulties').get();
  const districtsRefs = await db.collection('districts').get();
  let difficultyRef: firestore.DocumentData = firestore.DocumentReference;
  routeDifficultyRefs.docs.map((el) => {
    if (el.id === req.body.difficulty) {
      difficultyRef = el.ref;
    }
  });
  let arrayOfCategoriesRef: Array<firestore.DocumentData> = [];
  req.body.categories.map((el: any) => {
    routeCategoriesRefs.docs.map((elToFind) => {
      if (elToFind.id === el) {
        arrayOfCategoriesRef.push(elToFind.ref);
      }
    });
  });

  let arrayOfDistrictsRef: Array<firestore.DocumentData> = [];
  req.body.districts.map((el: any) => {
    districtsRefs.docs.map((elToFind) => {
      if (elToFind.id === el) {
        arrayOfDistrictsRef.push(elToFind.ref);
      }
    });
  });

  let arrayOfTypeRef: Array<firestore.DocumentData> = [];
  req.body.type.map((el: any) => {
    routeTypesRefs.docs.map((elToFind) => {
      if (elToFind.id === el) {
        arrayOfTypeRef.push(elToFind.ref);
      }
    });
  });
  let ObjectOfDurations: any = {};
  req.body.durations.forEach((el: any) => {
    ObjectOfDurations[el.name] = parseInt(el.number);
  });
  const rowToSave: {
    animals?: boolean;
    approved?: boolean;
    children?: boolean;
    wheelchair?: boolean;
    visuallyImpaired?: boolean;
    distance?: number;
    minutes?: number;
    title?: string;
    description?: string;
    types?: Array<firestore.DocumentData>;
    categories?: Array<firestore.DocumentData>;
    districts?: Array<firestore.DocumentData>;
    durations?: Object;
    difficulty?: firestore.DocumentData;
    images?: Array<any>,
    creator?: any
  } = {
    animals: !!req.body.animals,
    approved: !!req.body.approved,
    children: !!req.body.children,
    wheelchair: !!req.body.wheelChair,
    visuallyImpaired: !!req.body.visuallyImpaired,
    distance: Number(req.body.distance),
    minutes: Number(req.body.minutes),
    title: req.body.title,
    description: req.body.description,
    types: arrayOfTypeRef,
    categories: arrayOfCategoriesRef,
    districts: arrayOfDistrictsRef,
    durations: ObjectOfDurations,
    difficulty: difficultyRef,
    images: clearImageArray(req.body.images),
    creator: req.body.creator
  };
  try {
    const id = db.collection('routes').doc().id;
    await db.collection('routes').doc(id).create(rowToSave);
    res.json({
      success: true,
      id: id,
    });
  } catch (e) {
    res.status(500).json({
      message: 'Backend error',
    });
  }
};

const createUserRouteController = async function (req: any, res: any) {
  console.log(req.body);
  const routeTypesRefs = await db.collection('travel_types').get();
  const routeCategoriesRefs = await db.collection('categories').get();
  const routeDifficultyRefs = await db.collection('difficulties').get();
  const districtsRefs = await db.collection('districts').get();
  let difficultyRef: firestore.DocumentData = firestore.DocumentReference;
  routeDifficultyRefs.docs.map((el) => {
    if (el.id === req.body.difficulty) {
      difficultyRef = el.ref;
    }
  });
  let arrayOfCategoriesRef: Array<firestore.DocumentData> = [];
  req.body.categories.map((el: any) => {
    routeCategoriesRefs.docs.map((elToFind) => {
      if (elToFind.id === el) {
        arrayOfCategoriesRef.push(elToFind.ref);
      }
    });
  });

  let arrayOfDistrictsRef: Array<firestore.DocumentData> = [];
  req.body.districts.map((el: any) => {
    districtsRefs.docs.map((elToFind) => {
      if (elToFind.id === el) {
        arrayOfDistrictsRef.push(elToFind.ref);
      }
    });
  });

  let arrayOfTypeRef: Array<firestore.DocumentData> = [];
  req.body.type.map((el: any) => {
    routeTypesRefs.docs.map((elToFind) => {
      if (elToFind.id === el) {
        arrayOfTypeRef.push(elToFind.ref);
      }
    });
  });
  let ObjectOfDurations: any = {};
  req.body.durations.forEach((el: any) => {
    ObjectOfDurations[el.name] = parseInt(el.number);
  });
  const rowToSave: {
    animals?: boolean;
    approved?: boolean;
    children?: boolean;
    wheelchair?: boolean;
    visuallyImpaired?: boolean;
    distance?: number;
    minutes?: number;
    title?: string;
    description?: string;
    types?: Array<firestore.DocumentData>;
    categories?: Array<firestore.DocumentData>;
    districts?: Array<firestore.DocumentData>;
    durations?: Object;
    difficulty?: firestore.DocumentData;
    images?: Array<any>,
    creator?: any
  } = {
    animals: !!req.body.animals,
    approved: !!req.body.approved,
    children: !!req.body.children,
    wheelchair: !!req.body.wheelChair,
    visuallyImpaired: !!req.body.visuallyImpaired,
    distance: Number(req.body.distance),
    minutes: Number(req.body.minutes),
    title: req.body.title,
    description: req.body.description,
    types: arrayOfTypeRef,
    categories: arrayOfCategoriesRef,
    districts: arrayOfDistrictsRef,
    durations: ObjectOfDurations,
    difficulty: difficultyRef,
    images: clearImageArray(req.body.images),
    creator: req.body.creator
  };
  try {
    const id = db.collection('users_routes').doc().id;
    await db.collection('users_routes').doc(id).create(rowToSave);
    res.json({
      success: true,
      id: id,
    });
  } catch (e) {
    res.status(500).json({
      message: 'Backend error',
    });
  }
};

const updateDotsByRouteIdController = async function (req: any, res: any) {
  const id = req.params.id;
  const routeRef = await db.collection('routes').doc(id).get();
  const dotRefs = (await routeRef.get(
    'dots'
  )) as FirebaseFirestore.DocumentReference[];

  const dotsFromRequest = req.body as {
    [id: string]: {
      id: string;
      description: string;
      position: {
        lat: number;
        lng: number;
      };
      title: string;
      type: string;
      images: string[]
    };
  };

  try {
    const dotTypesRef = await db.collection('dot_types').get();
    await Promise.all(
      dotRefs.map((dotRef) => {
        const dot = dotsFromRequest[dotRef.id];
        if (dot) {
          const dotTypeRef = dotTypesRef.docs.find(
            (dotTypeRef) => dotTypeRef.id === dot.type
          );
          if (dotTypeRef) {
            return dotRef.update({
              position: new firestore.GeoPoint(
                dot.position.lat,
                dot.position.lng
              ),
              description: dot.description,
              type: dotTypeRef?.ref,
              images: clearImageArray(dot.images)
            });
          }
          return dotRef.update({
            position: new firestore.GeoPoint(
              dot.position.lat,
              dot.position.lng
            ),
            description: dot.description,
            images: clearImageArray(dot.images)
          });
        }
      })
    );

    res.json({
      success: true,
    });
  } catch (e) {
    res.status(500).json(e); // THIS IS AN ERROR!!! MAKE SURE YOU WONT EXPOSE SENSTIVE INFO HERE
  }
};

const updateDotsByUserIdController = async function (req: any, res: any) {
  const id = req.params.id;
  const routeRef = await db.collection('users_routes').doc(id).get();
  const dotRefs = (await routeRef.get(
    'dots'
  )) as FirebaseFirestore.DocumentReference[];

  const dotsFromRequest = req.body as {
    [id: string]: {
      id: string;
      description: string;
      position: {
        lat: number;
        lng: number;
      };
      title: string;
      type: string;
      images: string[]
    };
  };

  try {
    const dotTypesRef = await db.collection('dot_types').get();
    await Promise.all(
      dotRefs.map((dotRef) => {
        const dot = dotsFromRequest[dotRef.id];
        if (dot) {
          const dotTypeRef = dotTypesRef.docs.find(
            (dotTypeRef) => dotTypeRef.id === dot.type
          );
          if (dotTypeRef) {
            return dotRef.update({
              position: new firestore.GeoPoint(
                dot.position.lat,
                dot.position.lng
              ),
              description: dot.description,
              type: dotTypeRef?.ref,
              images: clearImageArray(dot.images)
            });
          }
          return dotRef.update({
            position: new firestore.GeoPoint(
              dot.position.lat,
              dot.position.lng
            ),
            description: dot.description,
            images: clearImageArray(dot.images)
          });
        }
      })
    );

    res.json({
      success: true,
    });
  } catch (e) {
    res.status(500).json(e); // THIS IS AN ERROR!!! MAKE SURE YOU WONT EXPOSE SENSTIVE INFO HERE
  }
};

const createDotController = async function (req: any, res: any) {
  console.log(req.body);
  const id = req.params.id;
  const routeRef = await db.collection('routes').doc(id);
  const dotTypesRef = await db.collection('dot_types').get();
  const dotsFromRequest = req.body as {
    id: string;
    description: string;
    position: {
      lat: number;
      lng: number;
    };
    title: string;
    type: string;
    images: string[];
  }[];

  try {
    const dotRefs = dotsFromRequest.map((dotFromRequest) => {
      const dotTypeRef = dotTypesRef.docs.find(
        (dotTypeRef) => dotTypeRef.id === dotFromRequest.type
      );
      if (dotFromRequest.id === '') {
        const createdDotRef = db.collection('dots').doc();
        createdDotRef.create({
          title: dotFromRequest.title,
          description: dotFromRequest.description,
          position: new firestore.GeoPoint(
            dotFromRequest.position.lat,
            dotFromRequest.position.lng
          ),
          type: dotTypeRef?.ref,
          images: dotFromRequest.images ? clearImageArray(dotFromRequest.images) : []
        });
        return createdDotRef;
      } else {
        const createdDotRef = db.collection('dots').doc(dotFromRequest.id);
        const obj = {
          title: dotFromRequest.title,
          description: dotFromRequest.description,
          position: new firestore.GeoPoint(
            dotFromRequest.position.lat,
            dotFromRequest.position.lng
          ),
          type: dotTypeRef?.ref,
          images: dotFromRequest.images ? clearImageArray(dotFromRequest.images) : []
        };
        createdDotRef.set(obj);
        return createdDotRef;
      }
    });
    await routeRef.update({
      dots: dotRefs,
    });
    res.json({
      success: true,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json(e); // THIS IS AN ERROR!!! MAKE SURE YOU WONT EXPOSE SENSTIVE INFO HERE
  }
};

const createDotByUserIdController = async function (req: any, res: any) {
  console.log(req.body);
  const id = req.params.id;
  const routeRef = await db.collection('users_routes').doc(id);
  const dotTypesRef = await db.collection('dot_types').get();
  const dotsFromRequest = req.body as {
    id: string;
    description: string;
    position: {
      lat: number;
      lng: number;
    };
    title: string;
    type: string;
    images: string[];
  }[];

  try {
    const dotRefs = dotsFromRequest.map((dotFromRequest) => {
      const dotTypeRef = dotTypesRef.docs.find(
        (dotTypeRef) => dotTypeRef.id === dotFromRequest.type
      );
      if (dotFromRequest.id === '') {
        const createdDotRef = db.collection('dots').doc();
        createdDotRef.create({
          title: dotFromRequest.title,
          description: dotFromRequest.description,
          position: new firestore.GeoPoint(
            dotFromRequest.position.lat,
            dotFromRequest.position.lng
          ),
          type: dotTypeRef?.ref,
          images: dotFromRequest.images ? clearImageArray(dotFromRequest.images) : []
        });
        return createdDotRef;
      } else {
        const createdDotRef = db.collection('dots').doc(dotFromRequest.id);
        const obj = {
          title: dotFromRequest.title,
          description: dotFromRequest.description,
          position: new firestore.GeoPoint(
            dotFromRequest.position.lat,
            dotFromRequest.position.lng
          ),
          type: dotTypeRef?.ref,
          images: dotFromRequest.images ? clearImageArray(dotFromRequest.images) : []
        };
        createdDotRef.set(obj);
        return createdDotRef;
      }
    });
    await routeRef.update({
      dots: dotRefs,
    });
    res.json({
      success: true,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json(e); // THIS IS AN ERROR!!! MAKE SURE YOU WONT EXPOSE SENSTIVE INFO HERE
  }
};

module.exports = {
  getAllRoutesController,
  getAllRoutesUsersController,
  updateLineByRouteIdController,
  updateLinesByUserIdController,
  updateRouteByIdController,
  updateRouteByUserIdController,
  createRouteController,
  createUserRouteController,
  updateDotsByRouteIdController,
  updateDotsByUserIdController,
  createDotController,
  createDotByUserIdController
}