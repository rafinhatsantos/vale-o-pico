export interface SpotPhoto {
  /** Miniatura de 1280 px no Wikimedia Commons (o loader troca a largura). */
  src: string;
  author: string;
  license: string;
  /** Página da foto no Commons, para o crédito. */
  page: string;
}

/**
 * Foto de cada pico, por slug. Todas vêm do Wikimedia Commons com licença
 * livre; o crédito aparece na página do pico e em /creditos.
 * Pico sem entrada aqui usa uma arte de reserva.
 */
export const PHOTOS: Record<string, SpotPhoto> = {
  "praia-grande": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Vista_Praia_Grande_SP.jpg/1280px-Vista_Praia_Grande_SP.jpg",
    author: "Andressa Rafaela",
    license: "CC BY-SA 2.0",
    page: "https://commons.wikimedia.org/wiki/File:Vista_Praia_Grande_SP.jpg",
  },
  "itanhaem": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/Itanha%C3%A9m_-_SP.jpg/1280px-Itanha%C3%A9m_-_SP.jpg",
    author: "Victor Fillipi",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Itanha%C3%A9m_-_SP.jpg",
  },
  "guarau": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/90/Praia_do_Guara%C3%BA_em_Peru%C3%ADbe.jpg/1280px-Praia_do_Guara%C3%BA_em_Peru%C3%ADbe.jpg",
    author: "Francisco Baraglia",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_do_Guara%C3%BA_em_Peru%C3%ADbe.jpg",
  },
  "itarare": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/Itarar%C3%A9%2C_S%C3%A3o_Vicente_-_SP%2C_Brazil_-_panoramio.jpg/1280px-Itarar%C3%A9%2C_S%C3%A3o_Vicente_-_SP%2C_Brazil_-_panoramio.jpg",
    author: "Jacinto@lves de Souz…",
    license: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Itarar%C3%A9,_S%C3%A3o_Vicente_-_SP,_Brazil_-_panoramio.jpg",
  },
  "tombo": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/Praia_do_Tombo_e_Praia_do_Guaiuba_em_Guaruj%C3%A1.jpg/1280px-Praia_do_Tombo_e_Praia_do_Guaiuba_em_Guaruj%C3%A1.jpg",
    author: "Jose Roberto Seixas",
    license: "Public domain",
    page: "https://commons.wikimedia.org/wiki/File:Praia_do_Tombo_e_Praia_do_Guaiuba_em_Guaruj%C3%A1.jpg",
  },
  "pitangueiras": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Praia_das_Pitangueiras%2C_Guaruj%C3%A1%2C_S%C3%A3o_Paulo_-_panoramio.jpg/1280px-Praia_das_Pitangueiras%2C_Guaruj%C3%A1%2C_S%C3%A3o_Paulo_-_panoramio.jpg",
    author: "Boris Karpuk",
    license: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_das_Pitangueiras,_Guaruj%C3%A1,_S%C3%A3o_Paulo_-_panoramio.jpg",
  },
  "pernambuco": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Praia_de_Pernambuco_-_Canto_da_Praia.jpg/1280px-Praia_de_Pernambuco_-_Canto_da_Praia.jpg",
    author: "Fabricio macedo",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_de_Pernambuco_-_Canto_da_Praia.jpg",
  },
  "juquehy": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/Praia_Juque%C3%AD.jpg/1280px-Praia_Juque%C3%AD.jpg",
    author: "Eduardo M.",
    license: "CC BY 2.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_Juque%C3%AD.jpg",
  },
  "camburi": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/S%C3%A3o_Sebasti%C3%A3o_-_Praia_de_Cambury_-_panoramio.jpg/1280px-S%C3%A3o_Sebasti%C3%A3o_-_Praia_de_Cambury_-_panoramio.jpg",
    author: "Larissa Fraga",
    license: "CC BY 3.0",
    page: "https://commons.wikimedia.org/wiki/File:S%C3%A3o_Sebasti%C3%A3o_-_Praia_de_Cambury_-_panoramio.jpg",
  },
  "maresias": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Maresias_1.jpg/1280px-Maresias_1.jpg",
    author: "Jorge Morales Piderit",
    license: "CC0",
    page: "https://commons.wikimedia.org/wiki/File:Maresias_1.jpg",
  },
  "bonete": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Praia_do_Bonete%2C_Ilhabela%2C_2021.jpg/1280px-Praia_do_Bonete%2C_Ilhabela%2C_2021.jpg",
    author: "Jcornelius",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_do_Bonete,_Ilhabela,_2021.jpg",
  },
  "castelhanos": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dc/PRAIA_DE_CASTELHANOS.jpg/1280px-PRAIA_DE_CASTELHANOS.jpg",
    author: "Iuri bertolini",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:PRAIA_DE_CASTELHANOS.jpg",
  },
  "vermelha-do-norte": {
    src: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Vista_da_Praia_Vermelha_do_Norte.jpg",
    author: "Bianca Manuela Lúcio Arcanjo",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Vista_da_Praia_Vermelha_do_Norte.jpg",
  },
  "itamambuca": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/Ubatuba_itamambuca.jpg/1280px-Ubatuba_itamambuca.jpg",
    author: "edsonaoki",
    license: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Ubatuba_itamambuca.jpg",
  },
  "trindade": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/28/Praia_do_Cepilho_-_Canto_Esquerdo%2C_Distrito_de_Trindade%2C_Paraty-RJ.jpg/1280px-Praia_do_Cepilho_-_Canto_Esquerdo%2C_Distrito_de_Trindade%2C_Paraty-RJ.jpg",
    author: "Ccpcunha",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_do_Cepilho_-_Canto_Esquerdo,_Distrito_de_Trindade,_Paraty-RJ.jpg",
  },
  "lopes-mendes": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/Praia_de_Lopes_Mendes%2C_Ilha_Grande.jpg/1280px-Praia_de_Lopes_Mendes%2C_Ilha_Grande.jpg",
    author: "Nathan Chor",
    license: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_de_Lopes_Mendes,_Ilha_Grande.jpg",
  },
  "grumari": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Praia_de_Grumari_by_Diego_Baravelli_01.jpg/1280px-Praia_de_Grumari_by_Diego_Baravelli_01.jpg",
    author: "Diego Baravelli",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_de_Grumari_by_Diego_Baravelli_01.jpg",
  },
  "prainha": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/Vista_da_Prainha_from_the_Pontal.jpg/1280px-Vista_da_Prainha_from_the_Pontal.jpg",
    author: "Alvaro.acosta.fo",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Vista_da_Prainha_from_the_Pontal.jpg",
  },
  "macumba": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/Praia_da_macumba_-_panoramio.jpg/1280px-Praia_da_macumba_-_panoramio.jpg",
    author: "patricia de miranda",
    license: "CC BY 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_da_macumba_-_panoramio.jpg",
  },
  "recreio": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/Praia_do_Recreio_-_Rio_de_Janeiro_%284580347140%29.jpg/1280px-Praia_do_Recreio_-_Rio_de_Janeiro_%284580347140%29.jpg",
    author: "Cyro A. Silva from Rio de Janeiro, Brasil",
    license: "CC BY 2.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_do_Recreio_-_Rio_de_Janeiro_(4580347140).jpg",
  },
  "barra-da-tijuca": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/Praia_da_Barra_da_Tijuca_rio.jpg/1280px-Praia_da_Barra_da_Tijuca_rio.jpg",
    author: "Arne Müseler",
    license: "CC BY-SA 3.0 de",
    page: "https://commons.wikimedia.org/wiki/File:Praia_da_Barra_da_Tijuca_rio.jpg",
  },
  "sao-conrado": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Praia_de_S%C3%A3o_Conrado_-_Rio.jpg/1280px-Praia_de_S%C3%A3o_Conrado_-_Rio.jpg",
    author: "VinnyWiki",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_de_S%C3%A3o_Conrado_-_Rio.jpg",
  },
  "arpoador": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/Arpoador_-_Rio_de_Janeiro.jpg/1280px-Arpoador_-_Rio_de_Janeiro.jpg",
    author: "Rafaellagonc",
    license: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Arpoador_-_Rio_de_Janeiro.jpg",
  },
  "itacoatiara": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Praia_de_Itacoatiara_em_Niter%C3%B3i.jpg/1280px-Praia_de_Itacoatiara_em_Niter%C3%B3i.jpg",
    author: "Brigiti Bandini",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_de_Itacoatiara_em_Niter%C3%B3i.jpg",
  },
  "itauna": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/Saquarema%2C_vista_para_praia_de_Ita%C3%BAna_-_panoramio.jpg/1280px-Saquarema%2C_vista_para_praia_de_Ita%C3%BAna_-_panoramio.jpg",
    author: "coiote022",
    license: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Saquarema,_vista_para_praia_de_Ita%C3%BAna_-_panoramio.jpg",
  },
  "arraial-do-cabo": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Praia_Grande_-_Arraial_do_Cabo_-_panoramio_%2816%29.jpg/1280px-Praia_Grande_-_Arraial_do_Cabo_-_panoramio_%2816%29.jpg",
    author: "Larissa Fraga",
    license: "CC BY 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_Grande_-_Arraial_do_Cabo_-_panoramio_(16).jpg",
  },
  "cabo-frio": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/80/PlayaForteSaoMateo1-CaboFrio-Brasil-feb2016.jpg/1280px-PlayaForteSaoMateo1-CaboFrio-Brasil-feb2016.jpg",
    author: "Ezarate",
    license: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:PlayaForteSaoMateo1-CaboFrio-Brasil-feb2016.jpg",
  },
  "geriba": {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/Praia_de_Gerib%C3%A1_deserta_durante_a_pandemia_de_COVID-19.jpg/1280px-Praia_de_Gerib%C3%A1_deserta_durante_a_pandemia_de_COVID-19.jpg",
    author: "Patrick Montenegro",
    license: "CC0",
    page: "https://commons.wikimedia.org/wiki/File:Praia_de_Gerib%C3%A1_deserta_durante_a_pandemia_de_COVID-19.jpg",
  },
};
