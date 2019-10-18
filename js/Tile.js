class Tile extends Domer {
    _content = "";
    _app;

    constructor(app){
        super();

        this._app = app;
    }

    onTileClick(e){
        if(this._app.XorY) {
            this._content = 'X';
        } else {
            this._content = 'O';
        }

        this._app.XorY = !this._app.XorY
    }

    render(html) {
        return html`
        <div click="onTileClick" class="divs">${this._content}</div>
        `
    }
}