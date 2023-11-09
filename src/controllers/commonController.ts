import { firestore } from 'firebase-admin';

const db = firestore();


async function getDotTypesController(req: any, res: any) {
	console.log("getDotTypesController");
    const dotTypeRefs = await db.collection('dot_types').get();
    res.json(
        dotTypeRefs.docs.map((dotTypeRef) => {
            const title = dotTypeRef.get('title');
            return {
                id: dotTypeRef.id,
                title,
            };
        })
    );
};

async function getDistricts(req: any, res: any) {
	console.log("getDistricts");
    const districtsRefs = await db.collection('districts').get();
    const districtArray = await Promise.all(districtsRefs.docs.map(async (districtRef) => {
        const title = districtRef.get('title');
        const areaRef = districtRef.get('area') as FirebaseFirestore.DocumentReference
        const id = areaRef.id
        return {
            id: districtRef.id,
            title: title,
            areaId: id
        }
    })
    )
    const areasRefs = await db.collection('areas').get();
    const responseAreasArray = areasRefs.docs.map((areaRef) => {
        const title = areaRef.get('title');
        return {
            id: areaRef.id,
            title,
            district: districtArray.filter((el) => el.areaId === areaRef.id)
        }
    })
    res.json(
        responseAreasArray
    );
};

async function getRouteCategories(req: any, res: any) {
	console.log("getDistricgetRouteCategoriests");
    const routeTypeRefs = await db.collection('categories').get();
    res.json(
        routeTypeRefs.docs.map((routeTypeRef) => {
            const title = routeTypeRef.get('title');
            return {
                id: routeTypeRef.id,
                title,
            };
        })
    );
};

async function getRouteDifficulties(req: any, res: any) {
	console.log("getRouteDifficulties");
    const routeTypeRefs = await db.collection('difficulties').get();
    res.json(
        routeTypeRefs.docs.map((routeTypeRef) => {
            const title = routeTypeRef.get('title');
            return {
                id: routeTypeRef.id,
                title,
            };
        })
    );
};

async function getRouteTypes(req: any, res: any) {
	console.log("getRouteTypes");
    const routeTypeRefs = await db.collection('travel_types').get();
    res.json(
        routeTypeRefs.docs.map((routeTypeRef) => {
            const title = routeTypeRef.get('title');
            return {
                id: routeTypeRef.id,
                title,
            };
        })
    );
};

async function deleteDotById(req: any, res: any) {
	console.log("deleteDotById");
    const iddot = req.params.iddot;
    try {
        await db.collection('dots').doc(iddot).delete();
        res.json({
            success: true,
        });
    } catch (e) {
        res.status(500).json(e); // THIS IS AN ERROR!!! MAKE SURE YOU WONT EXPOSE SENSTIVE INFO HERE
    }
};

async function deleteUserRouteById(req: any, res: any) {
	console.log("deleteUserRouteById");
    const id = req.params.id;
    try {
        await db.collection('users_routes').doc(id).delete();
        res.json({
            success: true,
        });
    } catch (e) {
        res.status(500).json(e); // THIS IS AN ERROR!!! MAKE SURE YOU WONT EXPOSE SENSTIVE INFO HERE
    }
};

module.exports = {
		getDotTypesController,
    getDistricts,
    getRouteCategories,
    getRouteDifficulties,
    getRouteTypes,
    deleteDotById,
    deleteUserRouteById
}