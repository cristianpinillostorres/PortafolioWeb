import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, setDoc, updateDoc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-storage.js";

import { verAutenticacion } from "./firebase.js";

const db = getFirestore();
const storage = getStorage();
var operacion;
var idRestauranteGolbal;
var permisos;

window.onload = function () {
    verAutenticacion();
    validarPermisos()
    cargarRestaurantes();
}

function validarPermisos(){
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const docRef = doc(db, "usuario", user.uid);
            getDoc(docRef).then(docSnap => {
                if (docSnap.exists()) {
                    const usuario = docSnap.data();
                    permisos = usuario.rol;
                    if (!permisos == false){
                        document.getElementById("btnCrearRestaurante").style.display = "block";   
                    }else{
                        $('#myTable tr> *:nth-child(7)').hide();
                    }
                }
            }).catch((error) => {
                console.log(error)
                document.getElementById("alertErrorLogueo").style.display = "block";
                document.getElementById("alertErrorLogueo").innerHTML = error.message;
            });
        }
    });
}


function cargarRestaurantes() {
    
    let contenido = "<table id='myTable' class='table mt-2'>";
    contenido += "<thead>";
    contenido += "<tr>";
    contenido += "<th>Nombre</th>";
    contenido += "<th>Direccion</th>";
    contenido += "<th>Telefono</th>";
    contenido += "<th>Rating</th>";
    contenido += "<th>Foto</th>";
    contenido += "<th>Menu</th>";
    contenido += "<th id='opciones' >Opciones</th>";
    contenido += "</tr>";
    contenido += "</thead>";
    contenido += "<tbody>";

    const q = query(collection(db, "restaurante"), where("visible", "==", true));
    getDocs(q).then(querySnapshot => {
        querySnapshot.forEach(rpta => {
            const fila = rpta.data();
            contenido += "<tr>";
            contenido += "<td>" + fila.nombre + "</td>";
            contenido += "<td>" + fila.direccion + "</td>";
            contenido += "<td>" + fila.telefono + "</td>";
            contenido += "<td>" + calularRating(fila.rating) + "</td>";
            contenido += "<td><img src=" + fila.foto + " width=\"100\" height=\"100\" /></td>";
            contenido += "<td><a href='" + fila.menu + "' target='_blank'>Ver Menu</a></td>";
            contenido += "<td class='opcionesRes'>";
            contenido += "<input type='button' class='btn btn-primary btn-sm' value='Editar' onclick='abrirModal(\"" + rpta.id + "\")' data-bs-toggle='modal' data-bs-target='#exampleModal' /> ";
            contenido += "<input type='button' value='Eliminar' class='btn btn-danger btn-sm' onclick='eliminar(\"" + rpta.id + "\")' />";
            contenido += "</td>";
            contenido += "</tr>";
        });
        contenido += "</tbody>";
        contenido += "</table>";

        document.getElementById("divRestaurante").innerHTML = contenido;

        
    }).catch((error) => {
        console.log(error);
    });

}

function calularRating(rating) {
    let contenido = "<div>";
    for (let i = 1; i <= 5; i++) {
        if (rating >= i)
            contenido += "<span class=\"fa fa-star checked\"></span>";
        else
            contenido += "<span class=\"fa fa-star \"></span>";
    }
    contenido += "</div>";
    return contenido;
}

window.abrirModal = function abrirModal(idRestaurante) {
    limpiarDatos();
    if (idRestaurante == 0) {
        operacion = 1;
        document.getElementById("lblTitulo").innerHTML = "Agregar restaurante";
    } else {
        operacion = 2;
        document.getElementById("lblTitulo").innerHTML = "Editar restaurante";
        idRestauranteGolbal = idRestaurante;
        cargarDatos(idRestaurante);
    }
}

function cargarDatos(idRestaurante) {
    const docRef = doc(db, "restaurante", idRestaurante);
    getDoc(docRef).then(docSnap => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById("txtnombre").value = data.nombre;
            document.getElementById("txtdireccion").value = data.direccion;
            document.getElementById("txttelefono").value = data.telefono;
            document.getElementById("imgFoto").src = data.foto;
            document.getElementById("iframePreview").src = data.menu;
        } else {
            alert("No se puede encontrar el restuarante");
        }
    }).catch((error) => {
        alert("Ocurrio un error" + error.message);
    });
}

function limpiarDatos() {
    document.getElementById("txtnombre").value = "";
    document.getElementById("txtdireccion").value = "";
    document.getElementById("txttelefono").value = "";
    document.getElementById("imgFoto").src = 'assets/img/noImage.png';
    document.getElementById("iframePreview").src = "";
    document.getElementById("alertaErrorCrearRestaurante").style.display = "none";
    document.getElementById("alertaErrorCrearRestaurante").innerHTML = "";
}

window.subirImage = function subirImage(e) {
    const file = e.files[0];
    let reader = new FileReader();
    reader.onloadend = function () {
        document.getElementById("imgFoto").src = reader.result;
    }
    reader.readAsDataURL(file);
}

window.subirArchivo = function subirArchivo(e) {
    const file = e.files[0];
    let reader = new FileReader();
    reader.onloadend = function () {
        document.getElementById("iframePreview").src = reader.result;
    }
    reader.readAsDataURL(file);
}

window.operar = function operar() {
    if (operacion == 1) {
        guardar();
    } else {
        editar();
    }
}

function guardar() {
    const nombre = document.getElementById("txtnombre").value;
    const direccion = document.getElementById("txtdireccion").value;
    const telefono = document.getElementById("txttelefono").value;
    const foto = document.getElementById("fileImage").files[0];
    const archivo = document.getElementById("file").files[0];
    let img = document.getElementById("imgFoto").src;

    if (nombre == "") {
      document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
      document.getElementById("alertaErrorCrearRestaurante").innerHTML = "Debe ingresar un nombre";
      return;
    }
    if (direccion == "") {
      document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
      document.getElementById("alertaErrorCrearRestaurante").innerHTML = "Debe ingresar una direccion";
      return;
    }
    if (telefono == "") {
        document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
        document.getElementById("alertaErrorCrearRestaurante").innerHTML = "Debe ingresar un telefono";
        return;
    }
    if (img.includes('assets/img/noImage.png')) {
        document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
        document.getElementById("alertaErrorCrearRestaurante").innerHTML = "Debe seleccionar una foto";
        return;
    }
    const newRestaurant = doc(collection(db, "restaurante"));
    setDoc(newRestaurant, {
        nombre: nombre,
        direccion: direccion,
        telefono:telefono,
        visible: true,
        rating: 5
    }).then(() => {
        const imageRef = ref(storage, 'restaurante/foto/' + newRestaurant.id);
        const uploadTask = uploadBytesResumable(imageRef, foto);
        const pdfRef = ref(storage, 'restaurante/menu/' + newRestaurant.id);
        const uploadTaskFile = uploadBytesResumable(pdfRef, archivo);

        Promise.all([uploadTask, uploadTaskFile]).then(values => {
            let flagSuccess = true;
            values.forEach(rpta => {
                if (rpta.state !== "success") {
                    flagSuccess = false;
                    return;
                }
            });
            if (flagSuccess) {
                const downloadUrlFoto = getDownloadURL(uploadTask.snapshot.ref);
                const downloadUrlPdf = getDownloadURL(uploadTaskFile.snapshot.ref);

                Promise.all([downloadUrlFoto, downloadUrlPdf]).then(valuesUpload => {
                    const restauranteRef = doc(db, "restaurante", newRestaurant.id);
                    updateDoc(restauranteRef, {
                        foto: valuesUpload[0],
                        menu: valuesUpload[1]
                    }).then(() => {
                        alert("Agregado correctamente");
                        document.location.href = "/";
                    }).catch(error => {
                        document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
                        document.getElementById("alertaErrorCrearRestaurante").innerHTML = error.errorMessage;
                    });
                });
            } else {
                document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
                document.getElementById("alertaErrorCrearRestaurante").innerHTML = "Ocurrio un error al cargar datos";
            }
        }).catch((error) => {
            document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
            document.getElementById("alertaErrorCrearRestaurante").innerHTML = error.errorMessage;
        });
    }).catch(error => {
        document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
        document.getElementById("alertaErrorCrearRestaurante").innerHTML = error.errorMessage;
    });

}

function editar() {
    const nombre = document.getElementById("txtnombre").value;
    const direccion = document.getElementById("txtdireccion").value;
    const telefono = document.getElementById("txttelefono").value;

    if (nombre == "") {
        document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
        document.getElementById("alertaErrorCrearRestaurante").innerHTML = "Debe ingresar un nombre";
        return;
      }
      if (direccion == "") {
        document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
        document.getElementById("alertaErrorCrearRestaurante").innerHTML = "Debe ingresar una direccion";
        return;
      }
      if (telefono == "") {
        document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
        document.getElementById("alertaErrorCrearRestaurante").innerHTML = "Debe ingresar un telefono";
        return;
    }
    const promises = [];
    let uploadTask, uploadTaskFile;
    if (document.getElementById("imgFoto").src.includes('data:image/')) {
        const foto = document.getElementById("fileImage").files[0];
        const imageRef = ref(storage, 'restaurante/foto/' + idRestauranteGolbal);
        uploadTask = uploadBytesResumable(imageRef, foto);
        promises.push(uploadTask);
    }
    if (document.getElementById("iframePreview").src.includes('data:application/')) {
        const archivo = document.getElementById("file").files[0];
        const pdfRef = ref(storage, 'restaurante/menu/' + idRestauranteGolbal);
        uploadTaskFile = uploadBytesResumable(pdfRef, archivo);
        promises.push(uploadTaskFile);
    }
    Promise.all(promises).then(values => {

        let flagSuccess = true;
        values.forEach(rpta => {
            if (rpta.state !== "success") {
                flagSuccess = false;
                return;
            }
        });
        if (flagSuccess) {
            let downloadUrlFoto, downloadUrlPdf;
            let fotoBoolean = false;
            let documentoBoolean = false;
            const promises2 = [];
            if (document.getElementById("imgFoto").src.includes('data:image/')) {
                downloadUrlFoto = getDownloadURL(uploadTask.snapshot.ref);
                promises2.push(downloadUrlFoto);
                fotoBoolean = true;
            }
            if (document.getElementById("iframePreview").src.includes('data:application/')) {
                downloadUrlPdf = getDownloadURL(uploadTaskFile.snapshot.ref);
                promises2.push(downloadUrlPdf);
                documentoBoolean = true;
            }
            Promise.all(promises2).then(values => {
                let fotoUrlFinal, documentoUrlFinal;
                if (fotoBoolean && documentoBoolean) {
                    fotoUrlFinal = values[0];
                    documentoUrlFinal = values[1];
                } else if (fotoBoolean && !documentoBoolean) {
                    fotoUrlFinal = values[0];
                    documentoUrlFinal = document.getElementById("iframePreview").src;
                } else if (!fotoBoolean && documentoBoolean) {
                    fotoUrlFinal = document.getElementById("imgFoto").src;
                    documentoUrlFinal = values[0];
                } else {
                    fotoUrlFinal = document.getElementById("imgFoto").src;
                    documentoUrlFinal = document.getElementById("iframePreview").src;
                }
                const restauranteRef = doc(db, "restaurante", idRestauranteGolbal);
                updateDoc(restauranteRef, {
                    nombre: nombre,
                    direccion: direccion,
                    telefono:telefono,
                    foto: fotoUrlFinal,
                    menu: documentoUrlFinal
                }).then(() => {
                    alert("Editado correctamente");
                    document.location.href = "/";

                }).catch(error => {
                    document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
                    document.getElementById("alertaErrorCrearRestaurante").innerHTML = error.errorMessage;
                });

            });
        } else {
            document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
            document.getElementById("alertaErrorCrearRestaurante").innerHTML = "Error al cargar documentos";
        }

    });
}

window.eliminar = function eliminar(idRestaurante) {
    const restauranteRef = doc(db, "restaurante", idRestaurante);
    updateDoc(restauranteRef, {
        visible: false
    }).then(() => {
        alert("Eliminado correctamente");
        cargarRestaurantes();
    }).catch((error) => {
        alert("Ocurrio un error al eliminar");
    });

}