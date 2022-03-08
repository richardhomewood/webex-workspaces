import commonData from '../../../../../../../data/common.json';

export function currentSizeClass() {
    const width = window.innerWidth
    let aSizeClass = ""
    commonData.sizeClasses.forEach((sizeClass) => {
        if (width <= sizeClass[2]) {
            aSizeClass = sizeClass[0]
        }
    })
    return aSizeClass;
}

export function timeout(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}