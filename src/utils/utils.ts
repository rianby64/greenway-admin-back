const clearImageArray = (images: Array<any>) => {
    return images.filter((el) => el != '')
}

const creatorManger = (creator: any) => {
    const creatorManaged: any = {};
    Object.keys(creator).map((el) => {
        if (creator[el] !== '') {
            creatorManaged[el] = creator[el]
        }
    })
    console.log(creatorManaged);
    return creatorManaged;
}

module.exports = {
    clearImageArray,
    creatorManger
};