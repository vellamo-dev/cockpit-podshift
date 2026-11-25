# PodShift UI

[English](readme.md) | Suomi

Muu dokumentaatio on englanniksi.

PodShift UI (`cockpit-podshift`) on [Cockpit](https://cockpit-project.org/)-lisäosa [PodShiftille](https://github.com/vellamo-dev/podshift). Se lisää Cockpitiin PodShift-sivun, jolla näet palvelimen kontit, volumet, verkot, imaget, salaisuudet, palvelut ja Quadletit.

PodShift on kevyt konttiorkestroinnin mahdollistaja pienille palvelimille: se muuttaa palvelimen sellaiseksi, joka asentaa itsensä, pitää itsensä turvassa ja päivittää sovelluksesi automaattisesti.

## PodShift ei tarvitse käyttöliittymää

PodShift toimii täysin ilman käyttöliittymää. Kaikki seuranta ja hallinta hoidetaan `podshift`-komennoilla päätteessä.

Käyttöliittymä on valinnainen. Se helpottaa seurantaa ja joitakin ylläpitotehtäviä niille, jotka pitävät enemmän verkkokäyttöliittymästä kuin päätteestä. Se edellyttää, että PodShift on asennettu samalle koneelle, mutta `cockpit-podshift`-paketti ei asenna PodShiftia puolestasi.

## Asennus

Asenna ensin [PodShift](https://github.com/vellamo-dev/podshift). Avaa sitten Cockpitissa **Applications** ja asenna PodShift UI sieltä. Kun se on asennettu, valitse **PodShift** Cockpitin valikosta.

Muut asennustavat, päivitykset ja poisto on kuvattu tiedostossa [docs/usage.md](docs/usage.md). Pidempi yleiskuva sivuista ja käyttöoikeuksista on tiedostossa [docs/readme.md](docs/readme.md). Tietoturvakäytäntö on tiedostossa [security.md](security.md).

## Lisenssi

Tämä projekti pohjautuu [Cockpit starter kitiin](https://github.com/cockpit-project/starter-kit). Uudet projektitiedostot on lisensoitu lisenssillä AGPL-3.0-or-later; katso `LICENSE`. Kaksi tiedostoa, joissa on edelleen huomattava osuus alkuperäistä starter kitin tai Cockpitin koodia, pysyvät lisenssillä LGPL-2.1-or-later; katso [docs/licenses/](docs/licenses/).
