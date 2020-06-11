import { Component, OnInit, ViewChild } from '@angular/core'
import { IUser, ISimulationInfos, IValueAvailable } from 'src/app/interfaces/user'
import { ManageUser } from 'src/app/services/manage-user.service'
import { Router } from '@angular/router'
import { LoadingController, IonSlides, IonInput } from '@ionic/angular'
import { PopoverController } from '@ionic/angular'
import { InformCPFComponent } from '../../component/inform-cpf/inform-cpf.component'
import { Storage } from '@ionic/storage'
import { HttpClient } from '@angular/common/http'
import { CreditData, ProductsBureau, Product } from '../../interfaces/margin-api'

@Component({
  selector: 'app-public-server',
  templateUrl: './public-server.page.html',
  styleUrls: ['./public-server.page.scss'],
})


export class PublicServerPage implements OnInit {
  @ViewChild('slides', { static: false }) slides: IonSlides
  @ViewChild('cpfInput', { static: false }) cpfInput: IonInput

  constructor(
    public http: HttpClient,
    private user: ManageUser,
    private router: Router,
    private popoverController: PopoverController,
    private loadingController: LoadingController,
    private storage: Storage
  ) {
    this.initPage()
  }

  ratingOptions = {
    autoHeight: true,
    loop: true,
    autoplay: true
  }

  userInfos: IUser = {}
  submitted = false
  cpfIsValid = false
  cpfIncomplete = true
  editCPF = true
  loading: HTMLIonLoadingElement
  toLoad = false
  slideOpts = {
    allowTouchMove: false,
    initialSlide: 0
  }
  simulation_infos: ISimulationInfos

  simulationOptions = []

  organ: string
  category: string

  ngOnInit() {

    this.storage.get('organ').then(res => {
      if (res) {
        this.category = res.organ
        if (res.organ == "Servidor Municipal")
          this.organ = 'pmsp'
        else if (res.organ == "Servidor Estadual")
          this.organ = 'govsp'
      }
      else {
        this.organ = 'pmsp'
        this.category = "Servidor Municipal"
      }
    })

  }

  initPage() {

    let now = new Date()
    now.setHours(0, 0, 0, 0)

    this.user.get().then(async infos => {
      if (infos) {
        this.userInfos = infos
        let simulation_infos = this.userInfos.simulation_infos
        if (!simulation_infos)
          this.simulation_infos = new ISimulationInfos()
        else
          this.simulation_infos = simulation_infos
        if (infos.cpf) {
          this.editCPF = false
          await new Promise(resolve => {
            setTimeout(() => {
              resolve()
            }, 50)
          })
          this.testCPF({ target: { value: infos.cpf } })
        }
        this.userInfos = <IUser>infos
      }
    })
  }

  checkMargin(user) {
    this.slideNext()
    this.getAPI(user)
  }

  getAPI(user: IUser, retry: number = 0) {

    let channel = "DRANN06DA"

      this.http.get(``)
        .subscribe({

          next: (a: any) => {
            if (retry < 2) {

              if (a.mensagem === ('Tente Novamente')) {
                setTimeout(() => {
                  this.getAPI(user, retry + 1)

                }, 10 * 1000);
              }
              else if (a.mensagem === "ESCC8017: SERVIDOR NAO PERMITE A CONSULTA DA MARGEM") {
                this.user.update(user).then(() => {
                  this.storage.set('lock_public-server', { lock: true })
                  this.router.navigateByUrl('credit-details')
                })
              } else if (a.mensagem === "CONSULTA OK") {


                const product: ProductsBureau = {
                  availableProducts: [
                    {
                      type: "Novo",
                      coefficients: [
                        {
                          installmentValue: a.margem_livre / 844,
                          installments: 84,
                          interest: 0,
                          receivedValue: a.margem_livre
                        }
                      ]
                    },
                    {
                      type: "Margem Complementar",
                      coefficients: [
                        {
                          installmentValue: a.margem_complementar / 84,
                          installments: 72,
                          interest: 0,
                          receivedValue: a.margem_complementar
                        }
                      ]
                    }

                  ]
                }

                this.simulation_infos.profile = 'Servidor público'
                this.simulation_infos.category = this.category

                const credit_data = new CreditData(product)

                user.credit_data = Object.assign({}, credit_data)
                user.value_available = this.calcMax(credit_data.products)
                user.simulation_infos = Object.assign({}, this.simulation_infos)

                this.user.update(user).then(() => {
                  this.storage.set('lock_public-server', { lock: false })
                  this.router.navigateByUrl('credit-details')
                }).catch(err => {

                  this.storage.set('lock_public-server', { lock: false })
                  this.router.navigateByUrl('credit-details')
                })

              } else if (a.mensagem === "ESCC0018: DADOS DE CADASTRO NAO LOCALIZADOS.") {
                this.router.navigateByUrl('credit-details')
              } else{
                this.getAPI(user, retry + 1)
              }
            }

            else {
              this.router.navigateByUrl('/error')
              this.http.post('', { ////url privada omitida
                "emailsOrIds": [
                  channel
                ],
                "message:":
                  `\nOcorreu um *ERRO* no App Credito familiar... ` +
                  `\n*Cliente CPF:* ${this.userInfos.cpf}` +
                  `\n*Erro:* Tentativas excedidas`

              }).subscribe({
                complete: () => { this.router.navigateByUrl('/error') },
                error: () => { }
              })
            }
          },
          error: err => {
            if (retry < 2)
              (this.getAPI(user, retry + 1))
            else {
             this.router.navigateByUrl('/error')
              this.http.post('', { //url privada omitida
                "emailsOrIds": [
                  channel
                ],
                "message:":
                  `\nOcorreu um *ERRO* no App Credito familiar... ` +
                  `\n*Cliente CPF:* ${this.userInfos.cpf}` +
                  `\n*Erro:* ${err}`

              }).subscribe({
                complete: () => { this.router.navigateByUrl('/error') },
                error: () => { }
              })
            }
          }

        })

  }

  rating = [
    {
      image: "../assets/img/credit-card-1.svg",
      rate: "Crédito Online, Prático e Seguro pra você ter presença com o que mais importa.",
      name: "Cintia Silvestre",
      city: "São Paulo",
      photo: "https://promotorapresenca.com.br/images/2018/02/25/cintia.jpg"
    },
    {
      image: "./assets/img/credit-card-2.svg",
      rate: "Todos os dias. A qualquer hora. Tecnologia para atender você.",
      name: "Eugênio Leite",
      city: "São Paulo",
      photo: "https://promotorapresenca.com.br/images/2018/02/25/eugenio.jpg"
    },
    {
      image: "./assets/img/credit-card-3.svg",
      rate: "Simulações, Andamento de contrato,\n Notificações E MUITO MAIS!",
      name: "Maria Lo Rocha",
      city: "Fortaleza",
      photo: "https://promotorapresenca.com.br/images/2018/02/25/marialo.jpg"
    }
  ]

  testCPF(ev) {
    let cpf = ev.target.value
    this.cpfIncomplete = cpf.length > 13 ? false : true
    this.cpfIsValid = this.validateCPF(cpf)
  }

  validateCPF(strCPF: string): boolean {
    var Soma
    var Resto
    Soma = 0
    strCPF = strCPF.replace(/[^0-9]/g, "")
    var reduce = s => s.split("").sort().reduce((a, b) => (a[a.length - 1] != b) ? (a + b) : a, "")
    if (reduce(strCPF) == "0") return false

    for (var i = 1; i <= 9; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i)
    Resto = (Soma * 10) % 11

    if ((Resto == 10) || (Resto == 11)) Resto = 0
    if (Resto != parseInt(strCPF.substring(9, 10))) return false

    Soma = 0
    for (var i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i)
    Resto = (Soma * 10) % 11

    if ((Resto == 10) || (Resto == 11)) Resto = 0
    if (Resto != parseInt(strCPF.substring(10, 11))) return false
    return true
  }

  async presentLoading() {
    this.toLoad = true
    this.loading = await this.loadingController.create({
      message: 'Aguarde',
      spinner: 'crescent'
    })
    if (this.toLoad)
      await this.loading.present()
  }

  slideNext() {
    this.slides.slideNext()
  }

  slidePrev() {
    this.slides.slidePrev()
  }


  public currency(number: number): string {
    if (number)
      return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    else
      return "R$ 0,00"
  }

  async presentPopover(ev: any, option: string) {

    const popover = await this.popoverController.create({
      component: InformCPFComponent,
      event: ev,
      mode: 'ios',
      componentProps: { option: option },
      translucent: false
    })

    await popover.present()
    const { data } = await popover.onWillDismiss()
    if (data == 'dont-inform')
      this.slideNext()
    // dont inform
  }

  private calcMax(products: Product[]): IValueAvailable {
    if (products) {
      var total = 0
      for (let i = 0; i < products.length; i++) {
        total += products[i].value
      }
    }
    return { valueFloat: total, valueText: this.currency(total) }
  }

  hideThing() {
    var x = document.getElementById("why-cpf");

    if (x.style.display != "none")
      x.style.display = "none"
    else
      x.style.display = "flex"

  }

}
