import Swiper from 'swiper';
import 'swiper/scss';
import {currentSizeClass} from "./spaces";

let swiper;

window.addEventListener('resize', () => {
    updateSwiper();
});

window.addEventListener('load', async function () {

    const slides = Array.from(document.querySelectorAll(`.ws-category-content-root .swiper.room-swiper .swiper-slide`));

    if (slides.length === 0) {
        return
    } else {
        slides.forEach((element) => {
            element.onclick = (e)=>{slideClick(e)};
        })
    }

    let wouldBeSwiper = this.document.querySelector(".ws-category-content-root .swiper");
    const options = await getSwiperOptions();
    swiper = new Swiper(wouldBeSwiper, options);

    let deviceSections = Array.from(document.querySelectorAll('.ws-device-section'));
    
    deviceSections.forEach(deviceSection => {
        
        let childNodes = Array.from(deviceSection.childNodes);
        childNodes = childNodes.filter((node)=> {
            return node.nodeName != "#text"
        })
        let childCount = childNodes.length;
        let lastNode = childNodes.lastItem;
        
        if (childCount % 2 != 0){
            lastNode.classList.add("oddEnd")
        }else if(lastNode.classList.contains("oddEnd")){
            lastNode.classList.remove("oddEnd")
        }
    });

});

const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const getSwiperOptions = async ()=>{
    const slides = Array.from(document.querySelectorAll(`.ws-category-content-root .swiper.room-swiper .swiper-slide`));
    const shadowSlides = Array.from(document.querySelectorAll(`.ws-category-content-root .swiper.shadowSwiper .swiper-slide`));
    let totalSlideWidth = 0;

    let options;
    await timeout(100)
    
    shadowSlides.forEach((element)=>{
        totalSlideWidth += element.offsetWidth;
    })

    let enabled = totalSlideWidth > (window.innerWidth - padding())

    if (!enabled) {
        slides.forEach((element)=>{
            element.style["min-width"] = "calc(100% / " + slides.length + ")";
        })
    } else {
        slides.forEach((element)=>{
            element.style["min-width"] = "initial";
        })
    }

    options = {
        speed: 400,
        slidesPerView: "auto",
        centeredSlides: true,
        centeredSlidesBounds: true,
        grabCursor: true,
        slideToClickedSlide: true,
        centerInsufficientSlides: true,
        enabled: enabled
    }

    return options
}

const padding = () => {
    let sizeClass = currentSizeClass();
    if (sizeClass == "ws-XS" || sizeClass == "ws-S") {
        return 36
    } 

    return 124;
}

const slideClick = (e)=>{

    const target = e.target.classList.contains("swiper-slide") ? e.target : e.target.parentNode
    const slides = Array.from(document.querySelectorAll(`.ws-category-content-root .swiper.room-swiper .swiper-slide`));
    const clickedIndex = slides.indexOf(target);

    const rooms = Array.from(document.querySelectorAll(".ws-category-content-root .ws-category-page-rooms .ws-category-page-room"))
    rooms.forEach((element, index) => {
        if (index == clickedIndex) {
            element.style["display"] = "block";
            element.style["opacity"] = 1 
            if(!slides[index].classList.contains("selected")){
                slides[index].classList.add("selected")
            }
        } else {
            element.style["opacity"] = 0 
            setTimeout(()=>{
                element.style["display"] = "none";
            },300)
            if(slides[index].classList.contains("selected")){
                slides[index].classList.remove("selected")
            }
        }
    })
}


const updateSwiper = (delay = 500) => {
    setTimeout(async () => {
        if (swiper) {
            const previosOptions = swiper.params;
            const {enabled : isEnabled  } = previosOptions;
            const options = await getSwiperOptions();
            const {enabled} = options;
            if (enabled && !isEnabled ) {
                swiper.enable();
                
            } else if(!enabled && isEnabled) {
                swiper.disable();
            }
            swiper.setProgress(0, 0);
            setTimeout(() => {
                swiper.setProgress(0, 0);
                setTimeout(() => {
                    swiper.setProgress(0, 0);
                }, 1000)
            }, 200)
        }
    }, delay)
}