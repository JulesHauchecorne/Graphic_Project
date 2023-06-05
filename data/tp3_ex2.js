"use strict";

// Variables globales
let canvas; // Pour la référence au canevas
let gl; // Le contexte graphique WebGL
let uniformAlpha; // Variable uniforme pour alpha
let uniformWidth; // Variable uniforme pour la largeur du canevas
let uniformHeight; // Variable uniforme pour la hauteur du canevas
let uniformColor; // Variable uniforme pour la couleur du pinceau
let uniformPointSize; // Variable uniforme pour la taille du pinceau
let attributeCoords; // Variable attribue pour la coordonnée du pinceau
let bufferCoords; // Référence au VBO des coordonnées
let mouseDown = false; // Pour vérifier si le bouton de la souris est enfoncé
let lastCoordinates; // Dernière coordonnées dessinée
let resolution = 1; // px
let pointSize = 16; // Taille du pinceau en px
let alpha = 0.1; // alpha
let brushColor = [0,0,0] // couleur du pinceau
let inputSize; // pour la référence au slider inputSize
let inputAlpha; // pour la référence au slider alpha
let inputEffacer; // pour la référence au bouton effacer
let alphaMax = 0.1; // alpha max
let alphaMin = 0.01; // alpha min

/* Shader de sommet */
// Complétez le shader de sommet 2.a
let vertexShaderSource = 
  "attribute vec2 a_coords; "+
    "uniform float u_width; "+
    "uniform float u_height; "+
    "void main() { "+
    "float x = -1.0 + 2.0*(a_coords.x / u_width); "+
    "float y = 1.0 - 2.0*(a_coords.y / u_height); "+
    "gl_Position = vec4(x, y, 0.0, 1.0); "+
    "} " ;

/* Shader de fragment */
// Complétez le shader de fragment 2.b
let  fragmentShaderSource =
  "precision mediump float;\n" +
    "uniform vec3 u_color;\n" +
    "uniform float u_alpha;\n" +
    "void main() {\n" +
    "   gl_FragColor = vec4(u_color, u_alpha);\n" +
    "}\n";



/* Fonction de dessin*/
function draw(x, y)
{
  let coordinates;
  if (lastCoordinates != null) {
    // TODO: 2.e Pour calculer une série de point à dessiner pour éviter l'aspect fragmenté des mouvement rapides
  } else {
    coordinates = [x,y];
  }

  let mouseCoordinates = new Float32Array(coordinates)
  // lastCoordinates = [x, y]; // TODO: Décommentez cette ligne pour la question 2.e

      gl.uniform3fv( uniformColor, brushColor );
      gl.uniform1f( uniformAlpha, alpha);

  let coords = new Float32Array(64);
    let k = 0;
         for (let  i = 0; i < 32; i++) {
             let  angle = i/32 * 2*Math.PI;
             coords[k++] = x + pointSize*Math.cos(angle);  // x-coord of vertex
             coords[k++] = y + pointSize*Math.sin(angle);  // y-coord of vertex
         }

  gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
  gl.bufferData(gl.ARRAY_BUFFER, coords, gl.STREAM_DRAW);
  gl.vertexAttribPointer(attributeCoords, 2, gl.FLOAT, false, 0, 0);

  //  Dessine la primitive (2.d)

  gl.drawArrays(gl.TRIANGLE_FAN, 0, coords.length/2);


}

function doMouseDown(event){
    /* Détermine la position (x,y) de la souris,
       en coord. de pixel du canvas.
    */
    if (mouseDown){
        let r = canvas.getBoundingClientRect();
        let x = event.clientX - r.left;
        let y = event.clientY - r.top;
        draw(x,y);
    }
}

/* Création du programme de shader */
function createProgram(gl, vertexShaderSource, fragmentShaderSource){
    let vsh = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsh, vertexShaderSource);
    gl.compileShader(vsh);
    if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
        throw "Erreur dans le shader de sommet : " + gl.getShaderInfoLog(vsh);
    }
    let fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsh, fragmentShaderSource);
    gl.compileShader(fsh);
    if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
        throw "Erreur dans le shader de fragments : " + gl.getShaderInfoLog(fsh);
    }

    let prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw "Erreur de liaison dans le programme : " + gl.getProgramInfoLog(prog);
    }
    return prog;
}

/* Initialisation du contexte graphique WebGL */
// 2.c Complétez le code d'initialisation
function initGL() {
    let prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(prog);

    // On doit récupérer la position des variables attributes et uniform
    // Configurez le VBO pour les coordonnées des traits de pinceau
    attributeCoords = gl.getAttribLocation(prog, "a_coords");
    bufferCoords = gl.createBuffer();
    //

    //  Récupérez les variables uniformes

    uniformWidth = gl.getUniformLocation(prog, "u_width");
    uniformHeight = gl.getUniformLocation(prog, "u_height");
    uniformColor = gl.getUniformLocation(prog, "u_color");
    uniformAlpha = gl.getUniformLocation(prog, "u_alpha");
    uniformPointSize = gl.getUniformLocation(prog, "u_pointsize");
   gl.uniform1f( uniformPointSize, pointSize);
    //  Assignation de valeurs des variables uniformes
    gl.uniform1f(uniformHeight, canvas.height);
    gl.uniform1f(uniformWidth, canvas.width);
    //  Activation du blending
    gl.enableVertexAttribArray(attributeCoords); 
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  
    //  Configuration de la couleur d'arrière-plan
    gl.clearColor(1,1,1,1);
    //  Effacez l'arrière-plan en initialisation.
    gl.clear(gl.COLOR_BUFFER_BIT);
}

/* Initialisation du programme */
//  2.c Complétez l'initialisation
function init() {
    try {
        canvas = document.getElementById("webglcanvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        //  2.c Définissez les options pour un programme de peinture
       let  options = {  
            alpha: false,
            depth: false,
            preserveDrawingBuffer: true
        };
        gl = canvas.getContext("webgl", options) ||
             canvas.getContext("experimental-webgl", options);
        console.log(gl)
        if ( ! gl ){
            throw "Le fureteur ne supporte pas WebGL"
        }
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML = 
        "<p>Désolé, problème avec le contexte graphique WebGL</p>"<
        console.log(e)
    }

    // Initialisation des inputs
    inputAlpha = document.getElementById("brushAlpha");
    inputAlpha.value = alpha;
    inputAlpha.min = alphaMin;
    inputAlpha.max = alphaMax;
    inputSize  = document.getElementById("brushSize");
    inputEffacer = document.getElementById("eraseCanvas");

    /* Initialisation du contexte graphique */
    try {
        initGL();
    } catch (e) {
        document.getElementById("canvas-holder").innerHTML = 
        "<p>Désolé, impossible d'initialiser le contexte graphique WebGL:" + e + "</p>;"
    }

    /* Ajout des event listener */
    // La fonction `doMouseDown` est appelée lorsque la souris bouge
    canvas.addEventListener("mousemove", doMouseDown, false);
    
    // Pour indiquer que le bouton de la souris est enfoncé
    document.body.onmousedown = function(){
        mouseDown = true;
    }

    // Pour indiquer que le bouton de la souris n'est plus enfoncé
    document.body.onmouseup = function(){
        mouseDown = false;
        lastCoordinates = null;
    }

    // Pour ajuster la taille du pinceau lorsque la roulette
    // de la souris est utilisée (scrollwheel)
    canvas.addEventListener("wheel", event => {
        const delta = Math.sign(event.deltaY);
        pointSize += delta;
        if (pointSize > 64){
            pointSize = 64;
        } else if (pointSize < 1) {
            pointSize = 1;
        }

        // Mise à jours du slider
        inputSize.value = pointSize;

    })
    
    // Pour ajuster le alpha du pinceau lorsque le slider
    // est déplacé
    inputAlpha.onchange = function(){
        alpha = this.valueAsNumber;
    }

    // Pour ajuster la taille du pinceau lorsque le slider
    // est déplacé
    inputSize.onchange = function(){
        pointSize = this.valueAsNumber;
    
        

    }

    // Pour effacer le canevas
    inputEffacer.onclick = function(){
        // Ajouter la commande pour effacer le canevas. exercice 2.c
    gl.clear(gl.COLOR_BUFFER_BIT);
    }
}
