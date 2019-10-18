class App extends Domer {
    _currentPicture = "/kitten2.jpg";
    _clickCount = 0;
    _images = ["/kitten2.jpg", "/tinyKitten.jpg"];
    _image = "/kitten2.jpg";
    _image2 = "/tinyKitten.jpg"
    constructor() {
        super()
    }

    render(html) {
        return html`
        <section>
            <section id="row">
                <div class="row">1</div>
                <div class="row">2</div>
                <div class="row">3</div>
                <div class="row">4</div>
                <div class="row">5</div>
                <div class="row">6</div>
                <div class="row">7</div>
                <div class="row">8</div>
                <div class="row">9</div>
            </section>
            <section id="column">
            <div class="row">Hej flexbox</div>
            <div class="row">Hej flexbox</div>
            <div class="row">Hej flexbox</div>
            <div class="row">Hej flexbox</div>
            <div class="row">Hej flexbox</div>
            <div class="row">Hej flexbox</div>
            <div class="row">Hej flexbox</div>
            <div class="row">Hej flexbox</div>
            <div class="row">Hej flexbox</div>
            </section>
            <section id="picture">
            <img src="${this._image}" click="changePicture">
            <img src="${this._images[this._clickCount]}" click="changePicture">
            <img src="${this._images[this._clickCount]}" click="changePicture">
            <img src="${this._images[this._clickCount]}" click="changePicture">
            <img src="${this._images[this._clickCount]}" click="changePicture">
            <img src="${this._images[this._clickCount]}" click="changePicture">
            <img src="${this._images[this._clickCount]}" click="changePicture">
            <img src="${this._images[this._clickCount]}" click="changePicture">
            <img src="${this._images[this._clickCount]}" click="changePicture">
            </section>
        </section>
        `
        }

    changePicture(){
        this._clickCount++;
        if(this._clickCount == this._images.length) {
            this._clickCount = 0;
        }
    }
}


new App();