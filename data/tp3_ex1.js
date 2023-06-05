"use strict";

let scene, camera, renderer;  // Bases pour le rendu Three.js
let controls; // Pour l'interaction avec la souris
let canvas;  // Le canevas où est dessinée la scène
let brainMaterial; // Matériau pour la surface du cerveau

/* Création de la scène 3D */
function createScene() {
    scene = new THREE.Scene();

    //  Créer une caméra, sur l'axe des Z positif
    camera = new THREE.PerspectiveCamera(45, canvas.width/canvas.height, 0.1, 100);
    camera.position.set( -1,2,2 );
    scene.add( camera );

    // Ajout d'une lumière liée à la caméra
  let lumiereCamera = new THREE.DirectionalLight(0xFFFFFF, 0.8);
   camera.add( lumiereCamera );
    
    //  Ajout d'une lumière ambiante
    let lumiereAmbiante = new THREE.AmbientLight(0xFFFFFF, 0.2);
    scene.add( lumiereAmbiante );
    // Modélisation du cerveau
    add_brainMesh("./allenMouseBrain.obj") // TODO: Décommenter à l'exercice 1.b

    // Modelisation du volume d'injection
    add_injectionVolumeMesh("./volumeInjection.obj"); // TODO: Décommenter à l'exercice 1.c

    // Modélisation des streamlines
    add_streamlines("./streamlines_100149109.json") // TODO: Décommenter à l'exercice 1.d
}

// TODO: COMPLÉTEZ CE CODE (exerice 1.b)
function add_brainMesh(url){
  // Importation de la surface du cerveau
  let brainIFS = loadBrain(url)
  const geometry = new THREE.BufferGeometry();
  // Ajout des sommets
  let position = [];
  for( let i = 0 ; i < brainIFS.vertexPositions.length; i++ ){
    position.push( brainIFS.vertexPositions[i][0] , brainIFS.vertexPositions[i][1] ,brainIFS.vertexPositions[i][2] )
  }
  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute(position , 3 ) );

  // Ajout des faces
  let faces = [];
  for( let i = 0 ; i < brainIFS.faces.length; i++ ){
    faces.push( brainIFS.faces[i][0] , brainIFS.faces[i][1] ,brainIFS.faces[i][2] )
  }
  geometry.setIndex(faces);
  //  Calcul des normales
  geometry.computeVertexNormals();
  //  Création du matériau
  const material = new THREE.MeshPhongMaterial( {
    transparent: true, 
    opacity: 0.25, 
    // refractionRatio : 0.25, 
    reflectivity: 1, 
    side: THREE.DoubleSide,
  } );

  // Création du maillage
  let	cerveau = new THREE.Mesh( geometry, material );
  // Rotation pour s'assurer que le dessus du cerveau est vers le haut.
  cerveau.rotateX(Math.PI) // TODO: Décommentez cette ligne

  // Ajout du modèle à la scène.
  scene.add( cerveau );
}

function add_injectionVolumeMesh(url){
  // Importation du volume d'injection
  let injectionIFS = loadInjection(url);
  const geometry = new THREE.BufferGeometry();
  //  Ajout des sommets
  let position = [];
  for( let i = 0 ; i < injectionIFS.vertexPositions.length; i++ ){
    position.push( injectionIFS.vertexPositions[i][0] , injectionIFS.vertexPositions[i][1] ,injectionIFS.vertexPositions[i][2] )
  }
  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute(position , 3 ) );
  //  Ajout des faces
  let faces = [];
  for( let i = 0 ; i < injectionIFS.faces.length; i++ ){
    faces.push( injectionIFS.faces[i][0] , injectionIFS.faces[i][1] ,injectionIFS.faces[i][2] )
  }
  geometry.setIndex(faces);
  //  Calcul des normales
  geometry.computeVertexNormals();

  //  Création du matériau
  const material = new THREE.MeshPhongMaterial( {
    // refractionRatio : 0.25, 
    // reflectivity: 1, 
    side: THREE.DoubleSide,
    color: 0x00FF00, 
    shininess: 30
  } );

  //  Création du maillage
  let	injection = new THREE.Mesh( geometry, material );
  
  // Rotation pour s'assurer que le dessus du cerveau est vers le haut.
   injection.rotateX(Math.PI) // TODO: Décommentez cette ligne

  //  Ajout du modèle à la scène.
  scene.add( injection );
}
/* Fonction ajoutant à la scène 3D toutes les streamlines 
   contenues dans le fichier fourni */
function add_streamlines(url){
    let streamlines = loadStreamlines(url)

    for (let i=0; i < streamlines.length; i++){
        add_singleStreamline(streamlines[i]);
    }
}

/* Fonction permettant d'ajouter un seul streamline à la scène 3D */
// TODO: COMPLÉTEZ CE CODE (exerice 1-d)
function add_singleStreamline(line){
  // line est un array dont chaque élément est un object JavaScript ayant les 
  // propriété x, y et z pour la position d'un point de ce streamline.
  let r, g, b;
  const points = [];
  const colors = [];
  for (let i = 0; i < line.length; i++){
    //Ajout d'un point dans l'array points.
    points.push( new THREE.Vector3(line[i].x, line[i].y, line[i].z));
    // Calcul de la couleur du point
    if ( i > 0 && i < line.length - 1 ){
      r = Math.abs( (line[i+1].z) - ( line[i-1].z ) )* 10; 
      g = Math.abs( (line[i+1].y) - ( line[i-1].y ) ) * 10; 
      b = Math.abs( (line[i+1].x) - ( line[i-1].x ) ) * 10; 
      colors.push(  r, g, b);
    }  
  }

  // Pour s'assurer que le 1er et le dernier point du streamline utilisent
  // bonne couleur
  colors[0] = colors[1]
  colors[colors.length-1] = colors[colors.length-2]

  // Création d'une géométrie pour contenir les sommets et les couleurs
  const geometry = new THREE.BufferGeometry().setFromPoints( points );
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors,3));

  //Création d'un matériau de type LineBasicMaterial

  const material = new THREE.LineBasicMaterial( {
    vertexColors: true, 
    linewidth: 2 
  } );

  //  Création d'un modèle
  const model = new THREE.Line( geometry, material );


  // Rotation pour s'assurer que le dessus du cerveau est vers le haut.
  model.rotateX(Math.PI); // TODO: Décommentez cette ligne

  //  Ajout du modèle à la scène.
  scene.add( model );
}

// Fontion d'initialisation. Elle est appelée lors du chargement du body html.
function init() {
    try {
        canvas = document.getElementById("glcanvas");
        renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
        renderer.setSize( window.innerWidth, window.innerHeight );
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<h3><b>Sorry, WebGL is required but is not available.</b><h3>";
        return;
    }

    // Création de la scène 3D
    createScene();


let cubeGeometry = new THREE.BoxGeometry(20,20,20);
let loader = new THREE.TextureLoader();
let materialArray = [
    new THREE.MeshBasicMaterial( { map: loader.load("./posz.png"), side: THREE.BackSide } ),
    new THREE.MeshBasicMaterial( { map: loader.load("./negz.png") , side: THREE.BackSide} ),
    new THREE.MeshBasicMaterial( { map: loader.load("./posy.png") , side: THREE.BackSide} ),
    new THREE.MeshBasicMaterial( { map: loader.load("./negy.png") , side: THREE.BackSide} ),
    new THREE.MeshBasicMaterial( { map: loader.load("./negx.png") , side: THREE.BackSide} ),
    new THREE.MeshBasicMaterial( { map: loader.load("./posx.png"), side: THREE.BackSide } ),
];
let cube = new THREE.Mesh( cubeGeometry, materialArray );
  cube.scale.x = -1;
  scene.add(cube);

    // Ajout de l'interactivité avec la souris
    controls = new THREE.TrackballControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.autoRotate = true;
    
    // Animation de la scène (appelée toute les 30 millisecondes)
    animate();
}

/* Animation de la scène */
function animate()
{
    controls.update();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
