var masterlist
const PixiSpine = PIXI.spine
const loader = PIXI.Assets

const Option_Panel = {
    isopen : false,
    curr : '',
    panel : document.getElementById('panel'),
    title : document.getElementById('title'),    
    addModel_Content : document.getElementById('addModel'),
    setting_Content : document.getElementById('setting'),
    spineInfo_Content : document.getElementById('spine-info'),
}

class spineViewer{

    _copyW = false
    _spineMap = new Map()
    constructor(element, {width, height, background, alpha}){
        this._element = element
        this._width = width ?? window.innerWidth
        this._height = height ?? window.innerHeight;

        //create PIXI Application
        this._app = new PIXI.Application({
            hello: false,
            antialias: true,
            autoStart: true,
            autoDensity: true,
            backgroundColor : background ?? 0x000000,
            backgroundAlpha: alpha ?? 1,
            width: width ?? this._width,
            height: height ?? this._height,
        })
        
        //add To HTML element
        element?.appendChild(this._app.view);

        //resize the PIXI Application and add event listener
        this._resize();
        window.addEventListener('resize', this._resize)
        
        //create main Container and add To Application
        this._mainContainer = new PIXI.Container()
        this._mainContainer.interactive = true 
        this._app.stage.addChild(this._mainContainer)

        //ticker
        // this._ticker = PIXI.Ticker.shared;
        // this._ticker.autoStart = true

        //Hello
        this._Hello()
    }

    static create(element, config = {}){
        return new this(element, config)
    }

    addSpine(label, _spineModel){

        if (this.isModelInList()){
            return
        }
        
        this._spineMap.set(label, _spineModel)
        let {width, height} = _spineModel.Model.getLocalBounds()
        
        let scale = 1
        if(width > this._width || height>this._height){
            let ratio = Math.min(width / this._width, height / this._height)
            scale = ratio - 0.1
        }

        _spineModel.setScale(scale)
        _spineModel.Model.position.set(this._width/2, this._height/2 + height*scale/2);
        this._mainContainer.addChild(_spineModel.Model)
    }

    getSpine(label){
        return this._spineMap.get(label)
    }
    
    removeSpine(label){
        let _spineModel = this.getSpine(label)
        this._mainContainer.removeChild(_spineModel.Model)
        _spineModel.destroy()
        return this._spineMap.delete(label)
    }

    setBackgroundColor(color){
        this._app.renderer.backgroundColor = color
    }

    isModelInList(label){
        return this._spineMap.has(label)
    }

    _resize = (e) => {
        if(e === void 0) { e = null; }
        this._width =  this._element.clientWidth
        this._height =  this._element.clientHeight;
        this._app.renderer.resize(this._width, this._height);
    }

    _Hello(){
        let log = [
            `\n\n %c  %c   CUE! Spine Viewer   %c  %c  https://github.com/Cpk0521  %c \n\n`,
            'background: #00ffff; padding:5px 0;',
            'color: #00ffff; background: #030307; padding:5px 0;',
            'background: #00ffff; padding:5px 0;',
            'background: #CCffff; padding:5px 0;',
            'background: #00ffff; padding:5px 0;',
        ]
        console.log(...log);
    }

    destroy(){
        this._app.destroy(true, { children: true, texture: true, baseTexture: true });
        this._app = null
    }

}

class SpineModel{

    constructor(spine, character, costume){
        this._spine = spine
        this._character = character
        this._costume = costume
        this._loopbool = true
        this._speed = 1
        this._scale = 1
        this._pointerEventBind()
    }

    static async create(json, character, costume){
       let resource = await loader.load(json)
       let _spine = new PixiSpine.Spine(resource.spineData);
       return new this(_spine, character, costume)
    }

    playAnimation(anim_name){
        this._currAnimation = anim_name
        this._spine.state.setAnimation(0, anim_name, this._loopbool);
    }

    setScale(scale){
        this._scale = scale
        this._spine.scale.set(scale)
    }

    changeSpeed(speed){
        this._speed = speed
        this._spine.state.timeScale = speed
    }

    setLoop(bool){
        this._loopbool = bool
        if(this._spine.state.tracks.length > 0){
            this._spine.state.setAnimation(0, this._currAnimation, this._loopbool);
        }
    }

    _pointerEventBind(){
        this._spine.interactive = true
        this._spine.cursor = 'pointer'

        this._spine.on("pointerdown", (e) => {
            this.dragging = true;
            this._spine._pointerX = e.data.global.x - this._spine.x;
            this._spine._pointerY = e.data.global.y - this._spine.y;
        });

        this._spine.on("pointermove", (e) => {
            if (this.dragging) {
                this._spine.position.x = e.data.global.x - this._spine._pointerX;
                this._spine.position.y = e.data.global.y - this._spine._pointerY;
            }
        });
        
        this._spine.on("pointerupoutside", () => (
            this.dragging = false
        ));
        this._spine.on("pointerup", () => (
            this.dragging = false
        ));
    }

    get AnimLoop(){
        return this._loopbool
    }

    get Scale(){
        return this._scale
    }

    get Speed(){
        return this._speed
    }

    destroy(){
        this._spine.destroy()
    }

    get Label() {
        return `${this._character}_${this._costume}`
    }

    get Character(){
        return this._character
    }

    get Costume(){
        return this._costume
    }

    get Model(){
        return this._spine
    }

    get Animations(){
        return this._spine.spineData.animations
    }

    
}

const setup_Character_Select = (data) => {
    let select = document.getElementById('characterSelect');
    let inner = '`<option>-----</option>'

    data.map((val) => {
        inner += `<option value="${val.id}">${val.name}</option>`
    })

    select.innerHTML = inner

    select.onchange = (e) => {
        if (e.target.selectedIndex == 0) {
            return;
        }

        let cid = e.target.value;
        let options = data.find(x => x.id == cid)
        setup_Costume_Select(options)
    }
}

const setup_Costume_Select = (options) => {
    let select = document.getElementById('costumeSelect');
    let inner = ``

    options.Spine.map(val => {
        inner += `<option value="${val.costumeId}">${val.costumeName}</option>`
    })

    select.innerHTML = inner
}

const Toggle_Option_Panel = (trigger, action = '') => {
    let {isopen, curr, panel, title} = Option_Panel
    
    if(trigger == curr && isopen){
        panel.style.display = "none";
        Option_Panel.isopen = false
        Option_Panel.curr = trigger
        Array.from(document.getElementsByClassName('content')).forEach(x => {
            x.style.display = "none";
        })
        return
    }

    if(isopen && trigger == 'close'){
        panel.style.display = "none";
        Option_Panel.isopen = false
        Option_Panel.curr = ''
        Array.from(document.getElementsByClassName('content')).forEach(x => {
            x.style.display = "none";
        })
        return
    }

    if((!isopen || trigger != curr) && action != 'remove'){
        panel.style.display = "block";
        Option_Panel.isopen = true
        Option_Panel.curr = trigger

        title.innerHTML = action.title
        Array.from(document.getElementsByClassName('content')).forEach(x => {
            x.style.display = "none";
        })

        let content = Option_Panel[`${action.content}_Content`]
        if(content)
            content.style.display = "block";
    }
}


Array.from(document.getElementsByClassName('collapsible')).forEach(x => {
    x.addEventListener('click', function() {
        this.classList.toggle("active");
        let content = this.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
          } else {
            content.style.display = "block";
          }
    })
})


const setup_Spine_Panel = (_spineModel) => {
    let ModelName = document.getElementById('info-ModelName')
    let CostumeName = document.getElementById('info-CostumeName')
    let anim_loop = document.getElementById('anim_loop')
    let anim_speed = document.getElementById('speed_Num')
    let model_scale = document.getElementById('scale_Num')

    ModelName.innerHTML = _spineModel.Character
    CostumeName.innerHTML = _spineModel.Costume
    anim_loop.checked = _spineModel.AnimLoop
    anim_speed.value = _spineModel.Speed
    model_scale.value = _spineModel.Scale

    Array.from(document.getElementsByClassName('collapsible')).forEach(x => {
        x.classList.remove('active')
        let content = x.nextElementSibling;
        content.style.display = "none";
    })

    let Animation_list = document.getElementById('Animation-list')
    let animations = _spineModel.Animations
    Animation_list.innerHTML = ``

    animations.forEach((anim)=>{
        let anim_btn =  document.createElement("button");
        anim_btn.innerHTML = anim.name

        anim_btn.onclick = () => {
            _spineModel.playAnimation(anim.name)
        }

        Animation_list.append(anim_btn)
    })

    anim_loop.onchange = function() {
        _spineModel.setLoop(this.checked)
    }

    anim_speed.oninput = function(){
        if(this.value == '')
            return
        _spineModel.changeSpeed(this.value)
    }

    model_scale.oninput = function(){
        if(this.value == '')
            return
        _spineModel.setScale(this.value)
    }

}

//-----------------------------------------------------------

/**
 * create Spine Viewer
 */
const viewerdiv = document.getElementById('viewer')
const appViewer = spineViewer.create(viewerdiv, {
    width: viewerdiv.clientWidth,
    height : viewerdiv.clientHeight
})

/**
 * load json data
 */
loader.load('./Assets/data/spineMaster.json')
    .then((json)=>{
        masterlist = json.Master
        setup_Character_Select(json.Master)
    })
    .catch((error)=>{
        console.error(`failed while loading index.json.`)
    })


document.getElementById('settingBtn').onclick = () => {
    Toggle_Option_Panel('setting', {
        title : 'Setting',
        content : 'setting'
    })
}

document.getElementById('addModelBtn').onclick = () => {
    Toggle_Option_Panel('addModel', {
        title : 'Add Model',
        content : 'addModel'
    })
}

document.getElementById('closebtn').onclick = () => {
    Toggle_Option_Panel('close')
}

document.getElementById('addSpineBtn').onclick = async() => {
    let charvalue = document.getElementById('characterSelect');
    let costvalue = document.getElementById('costumeSelect');

    if(charvalue.selectedIndex == 0 || costvalue.value == ''){
        return
    }

    let fulldata = masterlist.find(x => {return x.id == charvalue.value})
    let costdata = fulldata.Spine.find(y => y.costumeId == costvalue.value)

    charvalue.selectedIndex = 0
    costvalue.innerHTML = ''

    if(appViewer.isModelInList(`${fulldata.name}_${costdata.costumeName}`)){
        return
    }

    //new Spine & add to pixiapp
    let spinemodel = await SpineModel.create(`./Assets/${costdata.path}`, fulldata.name, costdata.costumeName)
    appViewer.addSpine(spinemodel.Label, spinemodel)

    let iconlist = document.getElementById('icon_list')
    let btn = document.createElement("button");

    if(costdata.icons != ''){
        btn.className = 'iconBtn'
        btn.style.backgroundImage = `url('./Assets/${costdata.icons}')`;
    }
    else{
        btn.className = 'wordBtn'
        btn.innerHTML = costdata.word ?? costdata.name.charAt(0)
    }

    btn.onclick = () => {
        Toggle_Option_Panel(spinemodel.Label, {
            title : 'Spine',
            content : 'spineInfo'
        })
        setup_Spine_Panel(spinemodel)
    }

    let div = document.createElement("div");
    div.className = 'delMinBtn'
    div.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-x" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M18 6l-12 12"></path>
                        <path d="M6 6l12 12"></path>
                    </svg>`
    div.onclick = (e) => {
        e = window.event || e
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        
        btn.remove()
        Toggle_Option_Panel(spinemodel.Label, 'remove')
        appViewer.removeSpine(spinemodel.Label)
    }

    btn.append(div)    
    iconlist.append(btn)

    Toggle_Option_Panel('close')
}


document.getElementById('colorPicker').oninput = function(){
    appViewer.setBackgroundColor(String(this.value).replace(/#/, '0x'))

}