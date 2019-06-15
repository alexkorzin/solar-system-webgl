export default class Mouse {
    constructor() {

        this.position = {
            x: 0,
            y: 0,
            _prevX: 0,
            _prevY: 0,

            normalX: 0,
            normalY: 0,

            inertX: 0,
            inertY: 0,

            document: {
                x: 0,
                y: 0,
                inertX: 0,
                inertY: 0
            }
        }

        this.speed = {
            x: 0,
            y: 0,
            scroll: 0,
        }

        this.prop = {
            scrollY: window.scrollY,
            _scrollY: window.scrollY
        }

        document.body.addEventListener('mousemove', (e) => {

            // Get cientX and clientY 
            this.position.x = this.position.document.x = e.clientX;
            this.position.y = e.clientY;


            // Get normalized values of clientX and clientY (from -1,-1 to 1,1)
            this.position.normalX = 2 * (e.clientX - (window.innerWidth / 2)) / window.innerWidth;
            this.position.normalY = 2 * (e.clientY - (window.innerHeight / 2)) / window.innerHeight;


            // Get position depend of page srollY value
            this.position.document.y = window.scrollY + e.clientY;

        });


        document.body.addEventListener('mouseleave', () => {
            this.position.inertX = this.position.inertX = 0;
            this.position.inertY = this.position.inertY = 0;
            this.position.normalX = this.position.normalX = 0;
        })
    }

    cumputeInertPos(inertionValue = 0.05) {

        // Cumpute the simple inertion (Normalized)  
        this.position.inertX += inertionValue * (this.position.normalX - this.position.inertX);
        this.position.inertY += inertionValue * (this.position.normalY - this.position.inertY);


        // Get inertion position depend of page srollY value
        this.position.document.inertX += inertionValue * (this.position.document.x - this.position.document.inertX);
        this.position.document.inertY += inertionValue * (this.position.document.y - this.position.document.inertY);

    }

    cumputeMoveSpeed(friction = 0.9) {

        //Compute mouse move speed
        this.speed.x += this.position.x - this.position._prevX;
        this.speed.y += this.position.y - this.position._prevY;


        //Slowly reduce speed 
        this.speed.x *= friction;
        this.speed.y *= friction;


        //Update the previous positions of mouse
        this.position._prevX = this.position.x;
        this.position._prevY = this.position.y;

    }

    cumputeScrollSpeed(friction = 0.9) {

        //Update scrollY info
        this.prop.scrollY = window.scrollY;


        //Cumpute scroll speed
        this.speed.scroll += this.prop.scrollY - this.prop._scrollY;


        //Reduce scroll speed
        this.speed.scroll *= friction;


        //Update the previous scroll info
        this.prop._scrollY = this.prop.scrollY;
    }

}
