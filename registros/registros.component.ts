import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { emailPattern, nombreApellidoPattern, validarUsername } from 'src/app/shared/validators/validators';
import { ValidatorsService } from 'src/app/shared/validators/validators.service';
import { EmailValidatorService } from '../../../shared/validators/email-validator.service';

@Component({
  selector: 'app-registros',
  templateUrl: './registros.component.html',
  styles: [
  ]
})
export class RegistrosComponent {

  constructor( private formBuilder: FormBuilder,
               private validatorService: ValidatorsService,
               private emailValidator: EmailValidatorService ) { }

  miFormulario: FormGroup = this.formBuilder.group({
    nombre: [ '', [Validators.required, Validators.pattern( this.validatorService.nombreApellidoPattern )] ],
    email: [ '', [Validators.required, Validators.pattern( this.validatorService.emailPattern )], [this.emailValidator] ],
    username: [ '', [Validators.required, this.validatorService.validarUsername] ],
    contraseña: [ '', [Validators.required, Validators.minLength(6)] ],
    fecha: [ '', Validators.required ],
    confirmar: [ '', [Validators.required] ],
  }, {
    validators: [ this.validatorService.camposIguales( 'contraseña', 'confirmar' ) ]
  })

  get emailErrorMsg(){

    const erros = this.miFormulario.get('email')?.errors
    if ( erros?.required ){
      return 'El correo es obligatorio'
    }else if ( erros?.pattern ){
      return 'El valor no tiene forma de correo'
    }else if ( erros?.emailTomado ){
      return 'El correo ya existe'
    }

    return ''

  }

  campoInvalido( campo: string ){
    return this.miFormulario.get( campo )?.invalid && this.miFormulario.get(campo)?.touched
  }

  verFecha(){
    //let fecha = this.miFormulario.get('fecha')?.value
    let fecha = moment( this.miFormulario.get('fecha')?.value )
    let edad = fecha.fromNow()
    console.log(fecha)
    console.log('mi edad es: '+edad
  }

  crearFormulario(){

    console.log(this.miFormulario.value)

    this.miFormulario.markAllAsTouched()
  }

}
