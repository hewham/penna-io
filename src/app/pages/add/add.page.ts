import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service'
import { FirestoreService } from '../../services/firestore.service'
import { ImageService } from '../../services/image.service'

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {

  errorMessage='';
  form: FormGroup;
  isLoading: boolean = false;

  showIcons: boolean = false;
  icon = "heart";

  images:any =  {
    tile: null,
    tileURL: "",
    cover: null,
    coverURL: ""
  }

  constructor(
    public navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private imageService: ImageService,
  ) {

    this.form = this.formBuilder.group({
      name : ['', Validators.compose([Validators.minLength(1), Validators.required])],
      slug : ['', Validators.compose([Validators.minLength(1), Validators.required])]
    });
  }

  ngOnInit() {
  }

  eventHandler(keyCode) { //function gets called on every keypress in phone number text box
    if (keyCode == 13) //13 is key code for enter
      this.submit();
  }

  toggleIcons() {
    this.showIcons = !this.showIcons;
  }

  selectIcon(icon) {
    this.icon = icon;
    this.toggleIcons();
  }
    
  async submit() {
    // this.trackingService.track("login_page_submit");
    if(this.validate()) {
      this.isLoading = true;
      let body = this.getBody();
      let success: any = false;
      success = await this.firestoreService.addGroup(body);
      if(success) {
        await this.authService.refreshUser();
        this.navCtrl.navigateRoot(`p/${body.slug}`);
      }
      this.isLoading = false;
    } else {
      // this.trackingService.track("login_page_invalid", { email : this.loginForm.controls.email.value, password: this.loginForm.controls.password.value } );
    }
  }

  getBody() {
    return {
      name: this.form.controls.name.value,
      slug: this.form.controls.slug.value,
      icon: this.icon,
      options: {
        shape: "long",
        type: "project"
      }
    }
  }

  validate() {
    if(!this.form.valid){
      if(this.form.controls.name.valid == false){
        this.errorMessage = 'Please enter a name';
        return false;
      } else if(this.form.controls.slug.valid == false){
        this.errorMessage = 'Please enter a URL slug';
        return false;
      }
    }
    return this.validateSlug(this.form.controls.slug.value);
  }

  validateSlug(slug) {
    const MIN_LENGTH = 1;
    const MAX_LENGTH = 32;
    const ALPHA_NUMERIC_REGEX = /^[a-z][a-z\-]*[a-z0-9]*$/;
    const START_END_HYPHEN_REGEX = /\A[^-].*[^-]\z/i;

    //if is too small or too big...
    if (slug.length < MIN_LENGTH || slug.length > MAX_LENGTH) {
      this.errorMessage = `Slug must have between ${MIN_LENGTH} and ${MAX_LENGTH} characters`;
      return false;
    }

    //if slug is started/ended with hyphen or is not alpha numeric
    if (!ALPHA_NUMERIC_REGEX.test(slug)) {
      this.errorMessage = 'Slug must only contain lowercase letters or numbers';
      return false;
    }

    this.errorMessage = "";
    return true;
  }
}