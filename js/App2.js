class App2 extends Domer {
    tiles = [];
    XorY = true;

    constructor(){
        super();

        for (let i = 0; i < 9; i++) {
            this.tiles.push(new Tile(this));
            
        }
    }

    render(html) {
        return html`
        <section id="sections" >
            ${this.tiles}
        </section>
        `
    }
}

new App2();