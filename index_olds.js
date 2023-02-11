class PixiApp{

    constructor(element, {width, height, background, alpha}){
        this._width = width
        this._height = height
        
        //create PIXI Application
        this._app = new PIXI.Application({
            hello: false,
            antialias: true,
            autoStart: true,
            autoDensity: true,
            backgroundColor : background ?? 0x000000,
            backgroundAlpha: alpha || 1,
            width: width ?? 1334,
            height: height ?? 750,
        })
        //add To HTML element
        element?.appendChild(this._app.view);

        //create main Container and add To Application
        this._mainContainer = new PIXI.Container()
        this._mainContainer.interactive = true 
        this._app.stage.addChild(this._mainContainer)

        //ticker
        // this._gsapTicker = gsap.ticker
        // this._ticker = PIXI.Ticker.shared;
        // this._ticker.autoStart = true
        // this._gsapTicker.add(() => { 
        //     this._ticker.update();
        // });
        // this._gsapTicker.fps(30);

        //resize the PIXI Application and add event listener
        this._resize();
        window.addEventListener('resize', this._resize)

    }

    static create(element, config = {}) {
        return new this(element, config)
    }

    _resize = () => {
        // let width = document.documentElement.clientWidth;
        // let height = document.documentElement.clientHeight;
        let width = window.innerWidth
        let height = window.innerHeight;

        let ratioX = width / (this._width ?? 1334)
        let ratioY = height / (this._height ?? 750)

        let reX = 0;
        let reY = 0;

        if(ratioX > ratioY){
            reX = (this._width ?? 1334) * ratioY 
            reY = (this._height ?? 750) * ratioY
        }else{
            reX = (this._width ?? 1334) * ratioX
            reY = (this._height ?? 750) * ratioX
        }

        this._app.view.style.width = reX + 'px';
        this._app.view.style.height = reY + 'px';
    }

    destroy(){
        this._app.destroy(true, { children: true, texture: true, baseTexture: true });
        this._app = null
    }

    get App(){
        return this._app
    }

    get mainContainer(){
        return this._mainContainer
    }

    get appSize(){
        return { width : this.App.renderer.width, height : this.App.renderer.height }
    }

}

const element = document.getElementById('app')
const app = PixiApp.create(element, {
    width : window.innerWidth,
    height : window.innerHeight
})