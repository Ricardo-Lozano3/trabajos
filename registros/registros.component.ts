import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl, FormsModule } from '@angular/forms';
import * as moment from 'moment';
import { AppService } from 'src/app/services/app.service';
import { Pipe, PipeTransform } from '@angular/core';
import { element } from 'protractor';

@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.css']
})
export class FormularioComponent implements OnInit {

  
  @ViewChild('contenedor', {static : true}) contenedor;


  public datosUsuario: FormGroup;
  public departamento = new FormControl ('', Validators.required);
  public formsBeneficiario: any = [];
  public buscarDepasMunis;
  public departamentos;
  public municipios;
  public intervalo;
  public valorSuscripcionTitular = 0;
  public valorSuscripcionBeneficiario = 0;
  public validarFormulario: string;
  public parentesco;
  public today;
  public beneficiarios = [];
  public status: string;
  public statusText: string;
  public infoBeneficiarios = [];


  constructor(private formBuilder: FormBuilder,
              private appService: AppService,) {

    this.today = moment( new Date().toString()).format('YYYY-MM-DD')
  }

  ngOnInit() {
    this.inicializarFormulario()
    this.getDepartamentos();
    this.getParentesco();
    //this.inicioPrueba()
    //this.valorSuscripcion()
    this.departamento.valueChanges.subscribe( () => {
      this.departamentoSelect();
    } );
  }

  inicializarFormulario(){
    this.datosUsuario = this.formBuilder.group({
      nombreCompleto : ['', [Validators.required, Validators.minLength(3), Validators.pattern('([a-zA-Z ñ]+) ([a-zA-Z ñ]+)')]],
      tipoDocumento : ['', [Validators.required]],
      fechaNacimiento: [ '', [ Validators.required ] ],
      fechaBeneficiario: [ '' ],
      numeroIdentificacion : ['', [Validators.required,Validators.pattern('[0-9]*')] ],
      email : ['', [Validators.required, Validators.email, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
      numeroCelular : ['', [Validators.required, Validators.pattern('[0-9]*')]],
      numeroCelular2 : ['', Validators.required],
      municipio : ['', [Validators.required]],
      direccion : ['', [Validators.required]],
      barrio : ['', [Validators.required]],
      profesion : [''],
      empresaDondeLabora : [''],
    })
  }

  inicioPrueba()
  {
    this.datosUsuario.reset({
      nombreCompleto: 'asdfasd asdfas',
      numeroIdentificacion: 1241234124,
      email: 'asdfa@asdf.com',
      numeroCelular: 1231231,
      direccion: 'asdasd',
      barrio: 'asdasd',
    })
  }

  getParentesco(){
    this.appService.getParentesco().subscribe( parentesco => {
      this.parentesco = parentesco;
    }, err => console.log( 'parentesco', err ) )
  };

  departamentoSelect() {
    this.selecionarMunicipio(this.departamento.value);
  }

  getDepartamentos() {
    this.appService.getDepartamentos().subscribe( (departamentos: any) => {
      this.departamentos = departamentos.body;
      //console.log(this.departamentos);
    }, err => {
    console.log('error get departamentos');
    } );
    
  }

  selecionarMunicipio(Municipio) {
    this.buscarDepasMunis = null;
    (<HTMLInputElement>document.getElementById('idmunicipio')).value = Municipio.nombreMunicipio + ' - ' + Municipio.nombreDepartamento;
    this.datosUsuario.get('municipio').setValue(Municipio.nombreMunicipio);
  }

  deparMuniBuscar(event:string){
    this.buscarDepasMunis = event
  }

  msgError( campo:string ){
    const errors = this.datosUsuario.get(campo).errors
    if ( errors.required ){
      return 'Este campo es requerido.'
    } else if ( errors.pattern ){
      return 'El formato ingresado es invalido.'
    }else if ( errors.minlength ) {
      return 'Cantidad minima de caracteres (3).'
    }

    return ''
  }

  campoInvalido( campo: string ){
    return this.datosUsuario.get(campo).invalid && this.datosUsuario.get(campo).touched
  }

  añoNacimiento(){
    return this.datosUsuario.get('fechaNacimiento').value
  }

  verEdad(){
    let fecha = moment( this.datosUsuario.get('fechaNacimiento').value )
    let edad = parseInt(fecha.fromNow())
    //console.log(fecha)
    //console.log('la edad es: '+edad)

    return edad;
  }

  valorSuscripcionTi(){
    let fechaT = moment( this.datosUsuario.get('fechaNacimiento').value )
    let edadT = parseInt(fechaT.fromNow())
    console.log('la edad es: '+edadT)
    if ( edadT < 65 ){
      this.valorSuscripcionTitular = 25000;
    }else if ( edadT > 64 && edadT < 70 ){
      this.valorSuscripcionTitular = 30000;
    }else if ( edadT > 69 && edadT < 74 ){
      this.valorSuscripcionTitular = 35000;
    } else if ( edadT > 74 ){
      this.status = 'error'
      this.statusText = 'El usuario es mayor de 74 años'
    }
  }

  valorBeneficiario(){
    let posicion = this.formsBeneficiario.length - 1;
    let formValido = [{campo : 'fechaBeneficiario', bol: false}]

    let fechaBeneficiario: any = document.getElementById('fechaBeneficiario' + posicion);
    fechaBeneficiario = fechaBeneficiario.value;
    formValido[0].bol = true
    //console.log(fechaBeneficiario)
    let fechaT = moment(fechaBeneficiario)
    let edad = parseInt(fechaT.fromNow())
    console.log('la edad es: '+edad)
    if ( edad < 65 ){
      this.valorSuscripcionBeneficiario = 25000;
    }else if ( edad > 64 && edad < 70 ){
      this.valorSuscripcionBeneficiario = 30000;
    }else if ( edad > 69 && edad < 74 ){
      this.valorSuscripcionBeneficiario = 35000
    } else if( edad > 74 ){
      this.status = 'error'
      this.statusText = 'El usuario es mayor de 74 años'
    }
  }

  obtenerDatosB(){
    
    if (this.formsBeneficiario.length >= 1) {
      
      let posicion = this.formsBeneficiario.length - 1;
      let formValido = [{campo : 'nombreYapellido', bol: false },
                         {campo : 'tipoDocumento', bol: false },
                         {campo : 'parentesco', bol: false },
                         {campo : 'numeroDocumento', bol: false },
                         {campo : 'fechaBeneficiario', bol: false },
                         {campo : 'numeroCelular', bol: false }];
  
       // nombre y apellido
       let nombreYapellido: any = document.getElementById('nombreYapellido' + posicion);
       nombreYapellido = nombreYapellido.value;
       console.log(nombreYapellido)
       formValido[0].bol = true;
       // Tipo de documento
       let tipoDocumento: any = document.getElementById('tipoDocumento' + posicion);
       tipoDocumento = tipoDocumento.value;
       console.log(tipoDocumento)
       formValido[1].bol = true;
       // Parentesco
       let parentesco: any = document.getElementById('parentesco' + posicion);
       parentesco = parentesco.value;
       console.log(parentesco)
       formValido[2].bol = true;
       // número de documento
       let numeroDocumento: any = document.getElementById('numeroDocumento' + posicion);
       numeroDocumento = numeroDocumento.value;
       console.log(numeroDocumento)
       formValido[3].bol = true;
       // Fecha de nacimiento
       let fechaBeneficiario: any = document.getElementById('fechaBeneficiario' + posicion);
       fechaBeneficiario = fechaBeneficiario.value;
       console.log(fechaBeneficiario)
       formValido[4].bol = true;
       // Numero de celular
       let numeroCelular: any = document.getElementById('numeroCelular' + posicion);
       numeroCelular = numeroCelular.value;
       console.log(numeroCelular)
       formValido[5].bol = true;
  
      this.beneficiarios.push({
        nombreYapellido,
        tipoDocumento,
        numeroDocumento,
        parentesco,
        fechaBeneficiario,
        numeroCelular
      })
    }

    console.log(this.datosUsuario.value)
    console.log(this.beneficiarios)
    
  }
  agregarBeneficiario() {

    // console.log(this.formsBeneficiario);

    if (this.formsBeneficiario.length <= 0) {

      if (this.validacionesFormularios() === 'valido') {
        this.formsBeneficiario.push({formulario : 'form'});
        this.intervalo =  setInterval(() => {
        document.getElementById('btn-scroll').click();
        }, 1);
      } else {
        this.status = 'error';
        this.statusText = 'Por favor llena los campos requeridos';
     }

    } else {

       let posicion = this.formsBeneficiario.length - 1;
       let formValido = [{campo : 'nombreYapellido', bol: false },
                         {campo : 'tipoDocumento', bol: false },
                         {campo : 'parentesco', bol: false },
                         {campo : 'numeroDocumento', bol: false },
                         {campo : 'fechaBeneficiario', bol: false },
                         {campo : 'numeroCelular', bol: false }];

       // nombre y apellido
       let nombreYapellido: any = document.getElementById('nombreYapellido' + posicion);
       nombreYapellido = nombreYapellido.value;
       console.log(nombreYapellido)
       formValido[0].bol = true;

       // Tipo de documento
       let tipoDocumento: any = document.getElementById('tipoDocumento' + posicion);
       tipoDocumento = tipoDocumento.value;
       console.log(tipoDocumento)
       formValido[1].bol = true;

       // Parentesco
       let parentesco: any = document.getElementById('parentesco' + posicion);
       parentesco = parentesco.value;
       console.log(parentesco)
       formValido[2].bol = true;

       // número de documento
       let numeroDocumento: any = document.getElementById('numeroDocumento' + posicion);
       numeroDocumento = numeroDocumento.value;
       console.log(numeroDocumento)
       formValido[3].bol = true;

       // Fecha de nacimiento
       let fechaBeneficiario: any = document.getElementById('fechaBeneficiario' + posicion);
       fechaBeneficiario = fechaBeneficiario.value;
       console.log(fechaBeneficiario)
       formValido[4].bol = true;

       // Numero de celular
       let numeroCelular: any = document.getElementById('numeroCelular' + posicion);
       numeroCelular = numeroCelular.value;
       console.log(numeroCelular)
       formValido[5].bol = true;

       var bol: boolean;

       //  console.log(formValido);
       // tslint:disable-next-line: prefer-for-of
       for (let i = 0; i < formValido.length; i++) {

        //console.log(bol)

        bol = formValido[i].bol;
        if (bol === false) {
            console.log('por aquii');
            break;
        }
       }

       if (bol === true) {
        this.formsBeneficiario.push({formulario : 'form'});
       }
    }

  }
  

  scroll() {
    let coordenadaY: number;
    coordenadaY = this.contenedor.nativeElement.offsetHeight;
    // console.log('aqui scroll', coordenadaY);
    window.scrollTo(0 , coordenadaY);
    clearInterval(this.intervalo);
  }

  generarRecibo() {

    if (this.validacionesFormularios() === 'valido') {
        console.log('generar recibo');
        //this.valorSuscripcion()
        window.alert('Generar recibo');
    } else {
      console.log('algo anda mal');
      window.alert('Algo anda mal, por favor revisa que los formularios estes completos.');
    }
    // console.log(this.formTitular);
  }

  validacionesFormularios(): string {

    // CASOS

   // SOLO SE INCRIBA EL TITULAR

   if (this.formsBeneficiario.length <= 0) {

     if (this.datosUsuario.valid) {
         //  console.log('valido');
          this.validarFormulario = 'valido';
          return 'valido';
     } else {
          this.validarFormulario = 'invalido';
          return 'invalido';
         //  console.log('invalido');
     }
  } else {
     // TITULAR Y BENEFICIARIOS
     // tslint:disable-next-line: prefer-for-of
     for (let i = 0; i < this.formsBeneficiario.length; i++) {

           let formValido = [{campo : 'nombreYapellido', bol: false },
                         {campo : 'tipoDocumento', bol: false },
                         {campo : 'parentesco', bol: false },
                         {campo : 'numeroDocumento', bol: false },
                         {campo : 'fechaBeneficiario', bol: false },
                         {campo : 'numeroCelular', bol: false }];

           // Nombre
           let nombreYapellido: any = document.getElementById('nombreYapellido' + i);
           nombreYapellido = nombreYapellido.value;

           // Validaciones nombre
           if (this.validacionCadenaDeTexto(nombreYapellido, 'nombreYapellido', i) === 'caracteres_validos') {
               formValido[0].bol = true;
           }

           // Tipo de documento
           let tipoDocumento: any = document.getElementById('tipoDocumento' + i);
           tipoDocumento = tipoDocumento.value;

           // Validaciones tipo de documento
           if (this.validacionesRequire(tipoDocumento, 'tipoDocumento', i) === 'valido') {
             formValido[1].bol = true;
           }

           // Parentesco
           let parentesco: any = document.getElementById('parentesco' + i);
           parentesco = parentesco.value;

           // Validaciones de parentesco
           if (this.validacionesRequire(parentesco, 'parentesco', i) === 'valido') {
             formValido[2].bol = true;
           }

           // número de documento
           let numeroDocumento: any = document.getElementById('numeroDocumento' + i);
           numeroDocumento = numeroDocumento.value;

           // validaciones numero de documento
           if (this.validacionNumeros(numeroDocumento, 'numeroDocumento', i) === 'numero_valido') {
             formValido[3].bol = true;
           }

           // Fecha de nacimiento
           let fechaBeneficiario: any = document.getElementById('fechaBeneficiario' + i);
           fechaBeneficiario = fechaBeneficiario.value;

           // Validaciones fecha de nacimiento
           if (this.validacionesRequire(fechaBeneficiario, 'fechaBeneficiario', i) === 'valido') {
             formValido[4].bol = true;
           }

           // Numero de celular
           let numeroCelular: any = document.getElementById('numeroCelular' + i);
           numeroCelular = numeroCelular.value;

           // validaciones numero de celular
           if (this.validacionNumeros(numeroCelular, 'numeroCelular', i) === 'numero_valido') {
             formValido[5].bol = true;
           }

           let bol = false;
           if ( formValido[0].bol === false ||
                formValido[1].bol === false ||
                formValido[2].bol === false ||
                formValido[3].bol === false ||
                formValido[4].bol === false ||
                formValido[5].bol === false 
              ) {
                bol = false;
                return 'invalido';
           } else {
             bol = true;
           }

          //console.log(nombreYapellido, tipoDocumento, parentesco, numeroDocumento, fechaBeneficiario, numeroCelular);
           this.infoBeneficiarios.push({nombreYapellido,
                                       tipoDocumento,
                                       parentesco,
                                       numeroDocumento,
                                       fechaBeneficiario,
                                       numeroCelular,
                                       bol});
         }

     // console.log(this.infoBeneficiarios);
     return 'valido';

     // console.log(bol);

     // if (bol === true) {
     //   return 'valido';
     // } else {
     //   return 'invalido';
     // }

   }

 }

 validacionCadenaDeTexto(texto: string, tipo: string, posicion): string {
  // console.log(texto, tipo, posicion);

  var caracteresInvalidos = '0123456789*/-_!|()#.,<>°+';

  if (tipo === 'nombreCompleto')  {
      if (texto) {
        for (let j = 0; j < texto.length; j++) {
          if (caracteresInvalidos.indexOf(texto.charAt(j), 0) != -1) {
            document.getElementById('nombreCompleto' + posicion).className = 'form-control is-invalid';
            document.getElementById('textno' + posicion).style.display = '';
            return 'caracteres_invalidos';
          } else {
            document.getElementById('nombreCompleto' + posicion).className = 'form-control';
            document.getElementById('textno' + posicion).style.display = 'none';
            return 'caracteres_validos';
          }
        }
      } else {
        document.getElementById('nombreCompleto' + posicion).className = 'form-control is-invalid';
        document.getElementById('textn' + posicion).style.display = '';
      }
    }
  }

validacionNumeros(numero: string, tipo: string, posicion: number): string {
  if (tipo === 'numeroDocumento')  {

    if (numero) {
      if ( numero.length < 5 || numero.length > 15 ) {
      // console.log('aqui');
      document.getElementById('numeroDocumento' + posicion).className = 'form-control is-invalid';
      document.getElementById('textndo' + posicion).style.display = '';
      return 'numero_invalido';
      }
      document.getElementById('numeroDocumento' + posicion).className = 'form-control';
      document.getElementById('textndo' + posicion).style.display = 'none';
      document.getElementById('numeroDocumento' + posicion).className = 'form-control';
      document.getElementById('textnd' + posicion).style.display = 'none';
      return 'numero_valido';
    } else {
      document.getElementById('numeroDocumento' + posicion).className = 'form-control is-invalid';
      document.getElementById('textnd' + posicion).style.display = '';
    }

  } else {

    if (numero) {

      if ( numero.length < 7 || numero.length > 15 ) {

        document.getElementById('numeroCelular' + posicion).className = 'form-control is-invalid';
        document.getElementById('textnce' + posicion).style.display = '';
        return 'numero_invalido';
      }

      document.getElementById('numeroCelular' + posicion).className = 'form-control';
      document.getElementById('textnce' + posicion).style.display = 'none';
      document.getElementById('numeroCelular' + posicion).className = 'form-control';
      document.getElementById('textnc' + posicion).style.display = 'none';
      return 'numero_valido';

    } else {
      document.getElementById('numeroCelular' + posicion).className = 'form-control is-invalid';
      document.getElementById('textnc' + posicion).style.display = '';
    }
  }
}

validacionesRequire(value, tipo: string, posicion: number): string {

  switch (tipo) {

    case 'tipoDocumento' :

      if (value) {
        document.getElementById('tipoDocumento' + posicion).className = 'form-control';
        document.getElementById('texttdo' + posicion).style.display = 'none';
        return 'valido';
      } else {
        document.getElementById('tipoDocumento' + posicion).className = 'form-control is-invalid';
        document.getElementById('texttdo' + posicion).style.display = '';
        return 'invalido';
      }
    break;

    case 'parentesco' :

      if (value) {
        document.getElementById('parentesco' + posicion).className = 'form-control';
        document.getElementById('textpa' + posicion).style.display = 'none';
        return 'valido';
      } else {
        document.getElementById('parentesco' + posicion).className = 'form-control is-invalid';
        document.getElementById('textpa' + posicion).style.display = '';
        return 'invalido';
      }
    break;

    case 'fechaBeneficiario' :

      if (value) {
        document.getElementById('fechaBeneficiario' + posicion).className = 'form-control';
        document.getElementById('textfn' + posicion).style.display = 'none';
        return 'valido';
      } else {
        document.getElementById('fechaBeneficiario' + posicion).className = 'form-control is-invalid';
        document.getElementById('textfn' + posicion).style.display = '';
        return 'invalido';
      }
    break;
  }
}

eliminarFormulario(index) {
  this.formsBeneficiario.splice(index, 1);
}

cambioHtml(ev, tipo, posicion) {
  // console.log(tipo);
  var value: any = document.getElementById(ev.target.id);
  value = value.value;

  switch (tipo) {

   case 'nombreYapellido' :
   this.validacionCadenaDeTexto(value, tipo, posicion);
   break;

   case 'tipoDocumento' :
   this.validacionesRequire(value, tipo, posicion);
   break;

   case 'parentesco' :
   this.validacionesRequire(value, tipo, posicion);
   break;

   case 'fechaBeneficiario' :
   this.validacionesRequire(value, tipo, posicion);
   break;

   case 'numeroCelular' :
   this.validacionNumeros(value, tipo, posicion);
   break;

   case 'numeroDocumento' :
   this.validacionNumeros(value, tipo, posicion);
   break;
  }
}

cerrarAlerta() {
  this.statusText = '';
  this.status = '';
}
  
}
