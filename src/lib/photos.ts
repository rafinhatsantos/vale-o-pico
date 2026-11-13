export interface SpotPhoto {
  /** Arquivo em public/picos, copiado do Wikimedia Commons. */
  src: string;
  author: string;
  license: string;
  /** Página da foto no Commons, para o crédito. */
  page: string;
}

/**
 * Foto de cada pico, por slug. Todas vêm do Wikimedia Commons com licença
 * livre e ficam copiadas em public/picos, para não depender de outro site; o crédito aparece na página do pico e em /creditos.
 * Um pico sem entrada aqui usaria uma arte de reserva.
 */
export const PHOTOS: Record<string, SpotPhoto> = {
  "praia-grande": {
    src: "/picos/praia-grande.jpg",
    author: "Andressa Rafaela",
    license: "CC BY-SA 2.0",
    page: "https://commons.wikimedia.org/wiki/File:Vista_Praia_Grande_SP.jpg",
  },
  "itanhaem": {
    src: "/picos/itanhaem.jpg",
    author: "Victor Fillipi",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Itanha%C3%A9m_-_SP.jpg",
  },
  "guarau": {
    src: "/picos/guarau.jpg",
    author: "Francisco Baraglia",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_do_Guara%C3%BA_em_Peru%C3%ADbe.jpg",
  },
  "itarare": {
    src: "/picos/itarare.jpg",
    author: "Jacinto@lves de Souz…",
    license: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Itarar%C3%A9,_S%C3%A3o_Vicente_-_SP,_Brazil_-_panoramio.jpg",
  },
  "tombo": {
    src: "/picos/tombo.jpg",
    author: "Jose Roberto Seixas",
    license: "Public domain",
    page: "https://commons.wikimedia.org/wiki/File:Praia_do_Tombo_e_Praia_do_Guaiuba_em_Guaruj%C3%A1.jpg",
  },
  "pitangueiras": {
    src: "/picos/pitangueiras.jpg",
    author: "Boris Karpuk",
    license: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_das_Pitangueiras,_Guaruj%C3%A1,_S%C3%A3o_Paulo_-_panoramio.jpg",
  },
  "pernambuco": {
    src: "/picos/pernambuco.jpg",
    author: "Fabricio macedo",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_de_Pernambuco_-_Canto_da_Praia.jpg",
  },
  "juquehy": {
    src: "/picos/juquehy.jpg",
    author: "Eduardo M.",
    license: "CC BY 2.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_Juque%C3%AD.jpg",
  },
  "camburi": {
    src: "/picos/camburi.jpg",
    author: "Larissa Fraga",
    license: "CC BY 3.0",
    page: "https://commons.wikimedia.org/wiki/File:S%C3%A3o_Sebasti%C3%A3o_-_Praia_de_Cambury_-_panoramio.jpg",
  },
  "maresias": {
    src: "/picos/maresias.jpg",
    author: "Jorge Morales Piderit",
    license: "CC0",
    page: "https://commons.wikimedia.org/wiki/File:Maresias_1.jpg",
  },
  "bonete": {
    src: "/picos/bonete.jpg",
    author: "Jcornelius",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_do_Bonete,_Ilhabela,_2021.jpg",
  },
  "castelhanos": {
    src: "/picos/castelhanos.jpg",
    author: "Iuri bertolini",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:PRAIA_DE_CASTELHANOS.jpg",
  },
  "vermelha-do-norte": {
    src: "/picos/vermelha-do-norte.jpg",
    author: "Bianca Manuela Lúcio Arcanjo",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Vista_da_Praia_Vermelha_do_Norte.jpg",
  },
  "itamambuca": {
    src: "/picos/itamambuca.jpg",
    author: "edsonaoki",
    license: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Ubatuba_itamambuca.jpg",
  },
  "trindade": {
    src: "/picos/trindade.jpg",
    author: "Ccpcunha",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_do_Cepilho_-_Canto_Esquerdo,_Distrito_de_Trindade,_Paraty-RJ.jpg",
  },
  "lopes-mendes": {
    src: "/picos/lopes-mendes.jpg",
    author: "Nathan Chor",
    license: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_de_Lopes_Mendes,_Ilha_Grande.jpg",
  },
  "grumari": {
    src: "/picos/grumari.jpg",
    author: "Diego Baravelli",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_de_Grumari_by_Diego_Baravelli_01.jpg",
  },
  "prainha": {
    src: "/picos/prainha.jpg",
    author: "Alvaro.acosta.fo",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Vista_da_Prainha_from_the_Pontal.jpg",
  },
  "macumba": {
    src: "/picos/macumba.jpg",
    author: "patricia de miranda",
    license: "CC BY 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_da_macumba_-_panoramio.jpg",
  },
  "recreio": {
    src: "/picos/recreio.jpg",
    author: "Cyro A. Silva from Rio de Janeiro, Brasil",
    license: "CC BY 2.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_do_Recreio_-_Rio_de_Janeiro_(4580347140).jpg",
  },
  "barra-da-tijuca": {
    src: "/picos/barra-da-tijuca.jpg",
    author: "Arne Müseler",
    license: "CC BY-SA 3.0 de",
    page: "https://commons.wikimedia.org/wiki/File:Praia_da_Barra_da_Tijuca_rio.jpg",
  },
  "sao-conrado": {
    src: "/picos/sao-conrado.jpg",
    author: "VinnyWiki",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_de_S%C3%A3o_Conrado_-_Rio.jpg",
  },
  "arpoador": {
    src: "/picos/arpoador.jpg",
    author: "Rafaellagonc",
    license: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Arpoador_-_Rio_de_Janeiro.jpg",
  },
  "itacoatiara": {
    src: "/picos/itacoatiara.jpg",
    author: "Brigiti Bandini",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_de_Itacoatiara_em_Niter%C3%B3i.jpg",
  },
  "itauna": {
    src: "/picos/itauna.jpg",
    author: "coiote022",
    license: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Saquarema,_vista_para_praia_de_Ita%C3%BAna_-_panoramio.jpg",
  },
  "arraial-do-cabo": {
    src: "/picos/arraial-do-cabo.jpg",
    author: "Larissa Fraga",
    license: "CC BY 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_Grande_-_Arraial_do_Cabo_-_panoramio_(16).jpg",
  },
  "cabo-frio": {
    src: "/picos/cabo-frio.jpg",
    author: "Ezarate",
    license: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:PlayaForteSaoMateo1-CaboFrio-Brasil-feb2016.jpg",
  },
  "geriba": {
    src: "/picos/geriba.jpg",
    author: "Patrick Montenegro",
    license: "CC0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_de_Gerib%C3%A1_deserta_durante_a_pandemia_de_COVID-19.jpg",
  },
  "mongagua": {
    src: "/picos/mongagua.jpg",
    author: "Luis Cláudio",
    license: "CC BY 2.0",
    page: "https://commons.wikimedia.org/wiki/File:Mongagu%C3%A1.jpg",
  },
  "baleia": {
    src: "/picos/baleia.jpg",
    author: "Kell Kell",
    license: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_da_Baleia_-_09-2012_-_panoramio_(2).jpg",
  },
  "felix": {
    src: "/picos/felix.jpg",
    author: "oscar fava",
    license: "CC BY 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_do_F%C3%A9lix_(Praia_do_L%C3%BAcio),_Ubatuba_-_SP,_Brazil_-_panoramio_(4).jpg",
  },
  "silveira": {
    src: "/picos/silveira.jpg",
    author: "Antônio João",
    license: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_da_Silveira_-_Garopaba_-_SC_-_panoramio.jpg",
  },
  "ferrugem": {
    src: "/picos/ferrugem.jpg",
    author: "Elis Luna",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_da_Ferrugem_-_Garopaba_SC_-_Elis_Luna_(03).jpg",
  },
  "rosa": {
    src: "/picos/rosa.jpg",
    author: "AndreaSimone",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_do_Rosa_Norte.jpg",
  },
  "guarda-do-embau": {
    src: "/picos/guarda-do-embau.jpg",
    author: "Rodrigo Soldon",
    license: "CC BY 2.0",
    page: "https://commons.wikimedia.org/wiki/File:Guarda_do_Emba%C3%BA,_Santa_Catarina,_Brasil_(3591497314).jpg",
  },
  "campeche": {
    src: "/picos/campeche.jpg",
    author: "HelenCampos",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_do_Campeche_em_Santa_Catarina_-_Brasil.jpg",
  },
  "joaquina": {
    src: "/picos/joaquina.jpg",
    author: "Luciano cta",
    license: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_da_Joaquina,_Florian%C3%B3polis,_Santa_Catarina.JPG",
  },
  "mole": {
    src: "/picos/mole.jpg",
    author: "Chamuscajr",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_Mole_Florian%C3%B3polis.jpg",
  },
  "mocambique": {
    src: "/picos/mocambique.jpg",
    author: "Thales Araujo Machado",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_do_Mo%C3%A7ambique,Florian%C3%B3polis,Brasil.jpg",
  },
  "santinho": {
    src: "/picos/santinho.jpg",
    author: "Amanda Likes",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Cost%C3%A3o_do_Santinho,_Florian%C3%B3polis,_SC.jpg",
  },
  "brava-itajai": {
    src: "/picos/brava-itajai.jpg",
    author: "Eduardo Marquetti",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_Brava_Itaja%C3%AD.jpg",
  },
  "setiba": {
    src: "/picos/setiba.jpg",
    author: "HVL",
    license: "CC BY 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_de_Setiba,_Guarapari_ES.JPG",
  },
  "meaipe": {
    src: "/picos/meaipe.jpg",
    author: "Túllio F",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_de_Mea%C3%ADpe_-_Guarapari.jpg",
  },
  "praia-da-costa": {
    src: "/picos/praia-da-costa.jpg",
    author: "HVL",
    license: "CC BY 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_da_Costa,_Vila_Velha_ES.JPG",
  },
  "itaparica": {
    src: "/picos/itaparica.jpg",
    author: "HVL",
    license: "CC BY 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_de_Itaparica,_Vila_Velha_ES.JPG",
  },
  "camburi-vitoria": {
    src: "/picos/camburi-vitoria.jpg",
    author: "Vilamir Azevedo",
    license: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_de_Camburi_-_Vit%C3%B3ria-ES_-_panoramio_(8).jpg",
  },
  "jacaraipe": {
    src: "/picos/jacaraipe.jpg",
    author: "Olivesan",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Jacara%C3%ADpe_Beach.jpg",
  },
};
