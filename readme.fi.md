# PodShift UI

[English](readme.md) | Suomi

Muu dokumentaatio on englanniksi.

PodShift UI (`cockpit-podshift`) on [Cockpit](https://cockpit-project.org/)-lisäosa [PodShiftille](https://github.com/vellamo-dev/podshift). Se lisää Cockpitiin PodShift-sivun, jolla näet, mitä palvelimella on.

PodShift on kevyt konttiorkestroinnin mahdollistaja pienille palvelimille: se muuttaa palvelimen sellaiseksi, joka asentaa itsensä, pitää itsensä turvassa ja päivittää sovelluksesi automaattisesti.

## Ominaisuudet

PodShift UI on valinnainen Cockpit-sivu PodShift-palvelimelle. Voit katsella palvelinta, kopioida näkemääsi ja hoitaa muutamia arkisia tehtäviä, kuten ympäristön asettamisen, määritysmuuttujan lisäämisen sekä sovelluksen asentamisen ja poistamisen.

Quadlet on pieni reseptitiedosto, joka kuvaa sovelluksen, taltion, verkon tai vastaavan, jotta PodShift voi asentaa ja käyttää sitä.

Välilehdet näkyvät alla olevassa järjestyksessä. Välilehti tai yksittäinen toiminto piilotetaan, jos asennettu PodShift ei tarjoa sitä. Päivitä otsikossa lataa nykyisen välilehden uudelleen. Välilehdillä Yleiskuva, Drop Quadlet, Kontit, Taltiot, Verkot ja Quadletit sen vieressä on Automaattinen päivitys -kytkin.

### Yleiskuva

Palvelimen kunto ja asetukset yhdellä silmäyksellä.

- Sivulla on kortit Tila, Käyttö, Tiedot, Määritykset ja Kunto. Kortti jää pois, jos PodShift ei voi tarjota sitä.
- Kopioi kunkin kortin valikossa kopioi kortin tekstinä.
- Käyttö-luvut ovat linkkejä, jotka avaavat vastaavan välilehden.
- Jotkin Tila- ja Tiedot-rivit avaavat liittyvän palvelun joko tässä käyttöliittymässä tai Cockpitin Services-sivulla.
- Kunto-kortti tiivistää viimeisimmän tarkistuksen. Näytä raportti sen valikossa, tai Näytä tiedot kun jokin on vialla, avaa Kunto-välilehden.
- Jos ympäristöä ei ole asetettu, välilehtien alle ilmestyy varoitus. Määritykset-kortissa arvo Ei asetettu avaa lyhyen lomakkeen, jolla merkin voi asettaa kerran, ehdotettujen tunnisteiden kanssa.
- Add variable, Määritykset-kortin valikossa, lisää mukautetun asetuksen. Napsauta olemassa olevan mukautetun arvon kohdalla muuttaaksesi tai poistaaksesi sen. Poisto pyytää ensin vahvistuksen.
- Verkkoasetuksia ja jo asetettua ympäristötunnistetta ei voi muuttaa täällä.

### Drop Quadlet

Asenna uusi sovellus pudottamalla sen reseptitiedosto sivulle.

- Vedä Quadlet-tiedosto tai zip pudotusalueelle, tai valitse tiedosto kohdasta Browse. Yksi tiedosto kerrallaan, enintään 50 KB: `.container`, `.volume`, `.network`, `.image` tai `.zip`.
- Pudotuksen jälkeen alue lukittuu hetkeksi, jotta toista tiedostoa ei lisätä liian pian.
- Drop History näyttää, mikä hyväksyttiin, asennettiin, evättiin tai oli jo valmiina.
- Install log näyttää edistymisen, myös muilla välilehdillä aloitetut asennuksen poistot.
- Install log -valikossa voit valita Newest first tai Oldest first, ja Kopioi loki kopioi näkyvät rivit.
- Automaattinen päivitys pysyy päällä, kun seuraat pudotuksen tai asennuksen poiston valmistumista.

### Kunto

Täysi kuntotarkistus, ryhmiteltynä niin, että näet mikä on kunnossa ja mikä kaipaa tarkempaa katsomista.

- Välilehden avaaminen tai Päivitä suorittaa uuden tarkistuksen. Edellinen tulos jää näkyviin tarkistuksen ajaksi.
- Jokainen ryhmä luettelee yksittäiset tarkistukset ja lyhyen vihjeen, kun jotain voi korjata.
- Kopioi raportin valikossa kopioi koko raportin tekstinä.

### Kontit

Käynnissä olevat sovelluksesi, kukin omalla kortillaan.

- Suodata nimen tai levykuvan mukaan ja vaihda lähde: Quadlet, Yksikkö tai Manuaalinen.
- Jokainen kortti näyttää tilansa ja auto-update-merkin, kun se on asetettu.
- Kortin valikosta: Kopioi, Tutki, Muuttujat ja Komennot.
- Tutki näyttää kaikki tiedot, jotka voi kopioida tai ladata.
- Muuttujat luettelee kontin ympäristömuuttujat. Salaiset arvot pysyvät piilossa, kunnes valitset Näytä salaisuudet. Luettelon voi kopioida.
- Komennot kokoaa valmiita kopioitavia pääte-, loki-, prosessi- ja järjestelmäkomentoja. Tämä sivu ei suorita niitä. Kopioi yksi komento, tai kopioi tai lataa koko sivu Markdown-tiedostona.
- Jos kontin on luonut asennettu Quadlet, valikkoon tulevat Näytä Quadlet ja Poista asennus. Poista asennus pyytää ensin vahvistuksen, ja taltion tiedot voi säilyttää tai poistaa.
- Näytä Podman-käyttöliittymässä avaa Cockpitin Podman-sivun, jos kyseinen paketti on asennettu.
- Automaattinen päivitys on pois päältä, kunnes kytket sen päälle tai asennuksen poisto on jonossa.

### Taltiot

Sovellustesi tallennustila, kukin omalla kortillaan.

- Suodata nimen tai liitoskohdan mukaan ja vaihda lähde.
- Kortin valikosta: Kopioi ja Tutki. Tutki-näkymässä tiedot voi kopioida tai ladata.
- Asennetun Quadletin luoman taltion asennuksen voi poistaa kortin valikosta, samalla valinnalla säilyttää tai poistaa taltion tiedot.
- Automaattinen päivitys on pois päältä, kunnes kytket sen päälle tai asennuksen poisto on jonossa.

### Verkot

Sovellustesi jakamat verkot, kukin omalla kortillaan.

- Suodata nimen mukaan ja vaihda lähde, myös sisäänrakennetut verkot.
- Kortin valikosta: Kopioi ja Tutki. Tutki-näkymässä tiedot voi kopioida tai ladata.
- Asennetun Quadletin luoman verkon asennuksen voi poistaa kortin valikosta.
- Automaattinen päivitys on pois päältä, kunnes kytket sen päälle tai asennuksen poisto on jonossa.

### Levykuvat

Palvelimen konttien levykuvat, kukin omalla kortillaan.

- Suodata nimen, osoitteen tai tunnisteiden mukaan ja vaihda lähde.
- Kortin valikosta: Kopioi ja Tutki. Tutki-näkymässä tiedot voi kopioida tai ladata.
- Näytä Quadlet näkyy, kun levykuva liittyy Quadlet-palveluun.
- Näytä Podman-käyttöliittymässä avaa Cockpitin Podman-sivun, jos kyseinen paketti on asennettu.
- Tällä välilehdellä ei ole Automaattinen päivitys -kytkintä. Käytä otsikon Päivitä-toimintoa.

### Salaisuudet

Salasanat ja muut salaisuudet, joita sovelluksesi käyttävät, kukin omalla kortillaan. Kortit itse eivät näytä salaisia arvoja.

- Suodata nimen mukaan ja vaihda Kaikki, Käytössä tai Käyttämätön.
- Kortin valikosta: Kopioi ja Tutki. Tutki näyttää tiedot, ei salaista arvoa. Näytetyn voi kopioida tai ladata.
- Tällä välilehdellä ei ole Automaattinen päivitys -kytkintä. Käytä otsikon Päivitä-toimintoa.

### Palvelut

podshift-käyttäjän taustapalvelut, kukin omalla kortillaan.

- Suodata nimen mukaan ja vaihda tila: Aktiivinen, Epäaktiivinen tai Epäonnistunut.
- Kortin valikosta: Kopioi, Näytä yksikkö, Näytä tila, Näytä loki ja Avaa loki.
- Näytä yksikkö avaa yksikkötiedoston, jonka voi kopioida tai ladata. Jos palvelu on syntynyt Quadletista, samassa näkymässä voi siirtyä tähän reseptiin, tai valita valikosta Näytä Quadlet.
- Näytä tila näyttää nykyisen tilan tekstinä, jonka voi kopioida.
- Näytä loki näyttää tuoreet lokirivit, jotka voi kopioida tai päivittää. Avaa loki valikossa tai siinä näkymässä avaa Cockpitin Logs-sivun tälle yksikölle.
- Tällä välilehdellä ei ole Automaattinen päivitys -kytkintä. Käytä otsikon Päivitä-toimintoa.

### Quadletit

Asennetut reseptit, jotka kuvaavat sovelluksiasi.

- Suodata nimen mukaan ja vaihda tila tai tyyppi, esimerkiksi kontti, taltio tai verkko.
- Kortti näyttää kuvauksen, kun reseptissä on sellainen, ja sovelluksen nimen, kun se on osa nippua.
- Kortin valikosta: Kopioi, ja Poista asennus kun PodShift tarjoaa sen. Poista asennus pyytää ensin vahvistuksen, ja taltion tiedot voi säilyttää tai poistaa, kun se on tarjolla.
- Reseptille, jolla on palvelu, Näytä Quadlet ja Näytä yksikkö avaavat reseptin tai yksikkötiedoston, jonka voi kopioida tai ladata, ja samassa ikkunassa voi vaihtaa näiden kahden näkymän välillä.
- Automaattinen päivitys on pois päältä, kunnes kytket sen päälle tai asennuksen poisto on jonossa.


## PodShift ei tarvitse käyttöliittymää

PodShift toimii täysin ilman käyttöliittymää. Kaikki seuranta ja hallinta hoidetaan `podshift`-komennoilla päätteessä.

Käyttöliittymä on valinnainen. Se helpottaa seurantaa ja joitakin ylläpitotehtäviä niille, jotka pitävät enemmän verkkokäyttöliittymästä kuin päätteestä. Se edellyttää, että PodShift on asennettu samalle koneelle, mutta `cockpit-podshift`-paketti ei asenna PodShiftia puolestasi.

## Asennus

Asenna ensin [PodShift](https://github.com/vellamo-dev/podshift). Avaa sitten Cockpitissa **Applications** ja asenna PodShift UI sieltä. Kun se on asennettu, valitse **PodShift** Cockpitin valikosta.

Muut asennustavat, päivitykset ja poisto on kuvattu tiedostossa [docs/usage.md](docs/usage.md). Pidempi yleiskuva sivuista ja käyttöoikeuksista on tiedostossa [docs/readme.md](docs/readme.md). Tietoturvakäytäntö on tiedostossa [security.md](security.md).

## Lisenssi

Tämä projekti pohjautuu [Cockpit starter kitiin](https://github.com/cockpit-project/starter-kit). Uudet projektitiedostot on lisensoitu lisenssillä AGPL-3.0-or-later; katso `LICENSE`. Kaksi tiedostoa, joissa on edelleen huomattava osuus alkuperäistä starter kitin tai Cockpitin koodia, pysyvät lisenssillä LGPL-2.1-or-later; katso [docs/licenses/](docs/licenses/).
