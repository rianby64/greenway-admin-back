async function getRoutes(db: FirebaseFirestore.Firestore) {
       try {
      const routesRef = await db.collection("routes").get();
      const routes = await Promise.all(
        routesRef.docs.map(async (routeRef) => {
          const categoriesRef = (await routeRef.get(
            'categories'
          )) as FirebaseFirestore.DocumentReference[];
          const dotsRef = (await routeRef.get(
            'dots'
          )) as FirebaseFirestore.DocumentReference[];
          const images = (await routeRef.get('images')) as String[];
          const lines = (await routeRef.get(
            'lines'
          )) as FirebaseFirestore.GeoPoint[];
          const typesRef = (await routeRef.get(
            'types'
          )) as FirebaseFirestore.DocumentReference[];
          const districtsRef = (await routeRef.get(
            'districts'
          )) as FirebaseFirestore.DocumentReference[];
          const difficultyRef = (await routeRef.get(
            'difficulty'
          )) as FirebaseFirestore.DocumentReference;
					const authorRef = (await routeRef.get(
            'author'
          )) as FirebaseFirestore.DocumentReference;

					const author = await authorRef.get();
					const authorId = author.id;
					const email = await author.get("email");
          return {
            id: routeRef.id,
            animals: routeRef.get('animals') as Boolean,
            approved: routeRef.get('approved') as Boolean,
            categories: categoriesRef
              ? await Promise.all(
                categoriesRef.map(async (categoryRef) => {
                  const category = await categoryRef.get();
                  return {
                    title: category.get('title') as String,
                    id: category.id,
                  };
                })
              )
              : [],
            children: routeRef.get('children') as Boolean,
            description: routeRef.get('description') as String,
            difficulty: (await difficultyRef.get()).id as String,
            visuallyImpaired: routeRef.get('visuallyImpaired') as Boolean,
            wheelchair: routeRef.get('wheelchair') as Boolean,
            dots: dotsRef
              ? await Promise.all(
                dotsRef.map(async (dotRef) => {
                  const dot = await dotRef.get();
                  const pos = dot.get('position') as FirebaseFirestore.GeoPoint;
                  if (typeof pos != 'undefined') {
                    const dottypeRef = (await dot.get(
                      'type'
                    )) as FirebaseFirestore.DocumentReference;
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
                        lat: pos.latitude,
                        lng: pos.longitude,
                      },
                      type: dottypeId,
                      title: await dot.get('title'),
											'title-tr': await dot.get('title-tr'),
                      images: await dot.get("images")
                    };
                  }
                })
              )
              : [],
            images,
            durations: routeRef.get('durations'),
            creator: routeRef.get('creator'),
            lines: lines.map((line) => {
              return { lat: line.latitude, lng: line.longitude };
            }),
            distance: routeRef.get('distance') as Number,
            minutes: routeRef.get('minutes') as Number,
            title: routeRef.get('title') as String,
            types: typesRef
              ? await Promise.all(
                typesRef.map(async (typeRef) => {
                  const type = await typeRef.get();
                  return {
                    title: type.get('title') as String,
                    id: type.id,
                  };
                })
              )
              : [],
            districts: districtsRef
              ? await Promise.all(
                districtsRef.map(async (districtRef) => {
                  const district = await districtRef.get();
                  const districtAreaRef = await district.get('area') as FirebaseFirestore.DocumentReference;
                  let areaId: string = ""
                  let areaName: string = ""
                  if (districtAreaRef) {
                    const area = await districtAreaRef.get()
                    areaId = area.id
                    areaName = await area.get('title');
                  }
                  return {
                    title: district.get('title') as String,
                    id: district.id as String,
                    area: {
                      areaId,
                      areaName
                    }
                  };
                })
              )
              : [],
						author: authorRef
							? {
								id: authorId,
								email: email
							} : null,
          };
        })
      );
  
      return routes;
    } catch (e) {
      console.log(e);
    }
  }

async function getRoutesByUserId(db: FirebaseFirestore.Firestore, id: number) {
    try {
      const routesRef = await db.collection("routes").get();
      const routes = await Promise.all(
        routesRef.docs.map(async (routeRef) => {
          const categoriesRef = (await routeRef.get(
            'categories'
          )) as FirebaseFirestore.DocumentReference[];
          const dotsRef = (await routeRef.get(
            'dots'
          )) as FirebaseFirestore.DocumentReference[];
          const images = (await routeRef.get('images')) as String[];
          const lines = (await routeRef.get(
            'lines'
          )) as FirebaseFirestore.GeoPoint[];
          const typesRef = (await routeRef.get(
            'types'
          )) as FirebaseFirestore.DocumentReference[];
          const districtsRef = (await routeRef.get(
            'districts'
          )) as FirebaseFirestore.DocumentReference[];
          const difficultyRef = (await routeRef.get(
            'difficulty'
          )) as FirebaseFirestore.DocumentReference;
					const authorRef = (await routeRef.get(
            'author'
          )) as FirebaseFirestore.DocumentReference;

					const author = await authorRef.get();
					const authorId = author.id;

					if (authorId !== id.toString()) {
						return;
					}

					const email = await author.get("email");
          return {
            id: routeRef.id,
            animals: routeRef.get('animals') as Boolean,
            approved: routeRef.get('approved') as Boolean,
            categories: categoriesRef
              ? await Promise.all(
                categoriesRef.map(async (categoryRef) => {
                  const category = await categoryRef.get();
                  return {
                    title: category.get('title') as String,
                    id: category.id,
                  };
                })
              )
              : [],
            children: routeRef.get('children') as Boolean,
            description: routeRef.get('description') as String,
            difficulty: (await difficultyRef.get()).id as String,
            visuallyImpaired: routeRef.get('visuallyImpaired') as Boolean,
            wheelchair: routeRef.get('wheelchair') as Boolean,
            dots: dotsRef
              ? await Promise.all(
                dotsRef.map(async (dotRef) => {
                  const dot = await dotRef.get();
                  const pos = dot.get('position') as FirebaseFirestore.GeoPoint;
                  if (typeof pos != 'undefined') {
                    const dottypeRef = (await dot.get(
                      'type'
                    )) as FirebaseFirestore.DocumentReference;
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
                        lat: pos.latitude,
                        lng: pos.longitude,
                      },
                      type: dottypeId,
                      title: await dot.get('title'),
											'title-tr': await dot.get('title-tr'),
                      images: await dot.get("images")
                    };
                  }
                })
              )
              : [],
            images,
            durations: routeRef.get('durations'),
            creator: routeRef.get('creator'),
            lines: lines.map((line) => {
              return { lat: line.latitude, lng: line.longitude };
            }),
            distance: routeRef.get('distance') as Number,
            minutes: routeRef.get('minutes') as Number,
            title: routeRef.get('title') as String,
            types: typesRef
              ? await Promise.all(
                typesRef.map(async (typeRef) => {
                  const type = await typeRef.get();
                  return {
                    title: type.get('title') as String,
                    id: type.id,
                  };
                })
              )
              : [],
            districts: districtsRef
              ? await Promise.all(
                districtsRef.map(async (districtRef) => {
                  const district = await districtRef.get();
                  const districtAreaRef = await district.get('area') as FirebaseFirestore.DocumentReference;
                  let areaId: string = ""
                  let areaName: string = ""
                  if (districtAreaRef) {
                    const area = await districtAreaRef.get()
                    areaId = area.id
                    areaName = await area.get('title');
                  }
                  return {
                    title: district.get('title') as String,
                    id: district.id as String,
                    area: {
                      areaId,
                      areaName
                    }
                  };
                })
              )
              : [],
						author: authorRef
							? {
								id: authorId,
								email: email
							} : null,
          };
        })
      );
  
      return routes.filter(r => r);
    } catch (e) {
      console.log(e);
    }
  }

  module.exports = {
    getRoutes,
		getRoutesByUserId
  };