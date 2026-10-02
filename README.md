# template-odontologia

Template Astro para criar versões personalizadas de sites odontológicos. A configuração inicial reproduz o site de Marina Costa. O conteúdo, as listas e as informações de marca ficam em **`src/config/site.ts`** e chegam aos componentes por props; não é necessário duplicar o HTML de uma seção para trocar um cliente.

## Usar como template no GitHub

Depois de enviar esta pasta a um repositório no GitHub, abra **Settings** e ative **Template repository**. Em cada novo cliente, use **Use this template** para criar um repositório independente. Consulte a [documentação oficial do GitHub](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository) se a interface mudar.

O `"private": true` do `package.json` impede a publicação acidental no npm; a visibilidade do repositório no GitHub é escolhida separadamente ao criá-lo.

Este repositório não inclui uma licença de uso para o código do template. Os arquivos GSAP em `public/assets/` mantêm os avisos de autoria e seguem os [termos próprios da GreenSock](https://gsap.com/standard-license/). A configuração inicial, as fotos e os depoimentos são demonstrativos; substitua-os por dados e imagens autorizados antes de publicar um site de cliente.

Não envie chaves ou arquivos de credenciais para o GitHub. O script de implantação procura `credentials.env` fora desta pasta, e o `.gitignore` também bloqueia cópias locais comuns de credenciais. Antes do primeiro envio, confira os arquivos que serão incluídos no commit.

## Começar

Requer Node.js 22.19 ou mais recente e npm.

```bash
npm install
npm run dev
```

Abra a URL mostrada no terminal, normalmente `http://localhost:4321/`.

```bash
npm run check   # verifica tipos e componentes Astro
npm run build   # gera o site estático em dist/
npm run preview # visualiza o build localmente
```

O projeto funciona localmente. Os comandos acima não publicam o site. A publicação opcional na Vercel é feita pelo script descrito abaixo.

## Criar a versão de um cliente

1. Faça uma cópia da pasta `template-odontologia` para o cliente, sem `node_modules/`, `.astro/` e `dist/`.
2. Ajuste o nome no `package.json` e gere um novo lockfile com `npm install`.
3. Edite `src/config/site.ts` de cima para baixo: SEO, identidade, seções, textos, links, imagens, mapa e formulário.
4. Coloque fotos e logos do cliente em `public/assets/` e referencie cada arquivo com caminho começando em `/assets/`.
5. Edite `src/config/og-image.json` e gere a imagem de compartilhamento com `python scripts/generate_og.py`.
6. Execute `npm run check` e `npm run build`. Revise desktop, mobile, menu, CTAs, mapa e formulário.

O conteúdo de demonstração não deve ser tratado como dados reais do cliente. Troque fotos, nomes, depoimentos e endereço antes de usar uma versão publicamente.

## Onde personalizar

| Área em `site.ts` | O que controla |
| --- | --- |
| `seo` | Título da aba, descrição, cor do navegador, favicon, URL pública e metadados Open Graph/X. |
| `theme` | Cores principais, cor do CTA, gradiente do rodapé e fontes. |
| `brand` | Nome, texto ou imagem do logo, nome grande do rodapé e descrição profissional. |
| `sections` | Exibe ou oculta as seções opcionais. A hero e o footer permanecem. |
| `navigation` | Menu, frase curta do header, botão de conversa e links de navegação. |
| `hero` | Foto de fundo, título, parágrafo e CTA. |
| `approach` | Frase de abertura, foto pequena e etapas numeradas. |
| `services` | Título, descrição e cards de serviços. |
| `space` | Texto, destaques e foto do espaço. |
| `about` | Texto e foto da seção Sobre. |
| `professional` | Título e lista de profissionais. |
| `gallery` | Título, fotos, legendas e velocidade da galeria contínua. |
| `testimonials` | Título e cards de avaliações. |
| `faq` | Perguntas e respostas. |
| `location` | Texto e consulta incorporada do Google Maps. |
| `contact` | Campos, opções, textos e modo de entrega da mensagem. |
| `footer` | Frase final, CTA, títulos das colunas, copyright e texto inferior. |

As interfaces TypeScript no início de `site.ts` descrevem as props. Se um campo obrigatório for removido ou tiver formato incorreto, `npm run check` aponta o problema.

### Marca e imagens

`brand.logoText` usa a assinatura textual com o ornamento atual. Para usar um logo do cliente, adicione `brand.logoImage`:

```ts
logoImage: {
  src: "/assets/logo-cliente.svg",
  alt: "Clínica Exemplo",
  width: 180,
  height: 60,
},
```

Troque também `brand.name`, `brand.footerWords`, `brand.profession`, `navigation.menuGreeting`, `professional.items`, `footer.copyright` e `seo`. O nome grande do rodapé aceita qualquer quantidade de palavras. Se o nome for longo, use `brand.footerWordmarkFontSize`, por exemplo `"clamp(54px, 8vw, 140px)"`, e confira no mobile.

Cada imagem de conteúdo tem `src`, `alt`, `width` e `height`. Atualize as dimensões conforme o arquivo real para reservar espaço durante o carregamento. A foto da hero usa `hero.backgroundImage` e deve ter boa legibilidade sob o texto; o degradê escuro da hero está em `public/styles.css`.

### Imagem de compartilhamento (OG image)

O template inclui uma imagem padrão em `public/og-image.png` e um gerador local em `scripts/generate_og.py`. A ideia é usar uma **foto diferente para cada cliente**, fornecida pela clínica ou criada por IA, e compor o nome e a frase com tipografia nítida no script. Peça uma imagem **sem texto**, com espaço livre no lado em que o nome aparecerá. Isso evita letras deformadas na imagem gerada por IA e permite trocar a fonte depois sem refazer a foto.

1. Salve a foto em `public/assets/`, por exemplo `public/assets/og-clinica-aurora.webp`.
2. Edite `src/config/og-image.json`: `background`, `name`, `eyebrow`, `subtitle`, `imageAlt` e as cores. Use `\n` em `name` para definir uma quebra de linha. `focalPoint` ajusta o enquadramento com dois valores de 0 a 1; `textSide` aceita `left` ou `right`.
3. Instale a dependência do gerador e execute:

```bash
python -m pip install -r scripts/requirements-og.txt
python scripts/generate_og.py
```

O resultado fica em `public/og-image.png`, com **1200 × 630 px**. Você também pode testar uma variante sem editar o JSON:

```bash
python scripts/generate_og.py --background public/assets/og-clinica-aurora.webp --name "Clínica Aurora" --font public/assets/fonts/minha-fonte.ttf --subtitle "Um novo jeito de cuidar do sorriso"
```

Para reproduzir a variante mais tarde, salve esses valores no JSON. O campo `font` recebe o caminho de uma fonte `.ttf` ou `.otf` que você tenha licença para usar; vazio usa uma fonte disponível no computador. Informe o arquivo da fonte na versão final para ter o mesmo resultado em outros computadores. `fileName` define a saída dentro de `public/` e é usado automaticamente em `seo.openGraph.image`, sem repetir o caminho no `site.ts`. O `imageAlt` também é compartilhado entre o JSON e os metadados.

Em `site.ts`, configure `seo.siteUrl` com a URL pública completa do cliente, por exemplo `"https://clinica-exemplo.com/"`. Só então o build emite `og:url`, `og:image` e o endereço da imagem como URLs absolutas. Deixe o campo vazio enquanto só houver preview local; não use `localhost` nem o domínio de outro cliente em uma versão pública. O script de publicação injeta `PUBLIC_SITE_URL` durante o build, usando o domínio informado no comando; isso evita publicar uma OG image com URL de outro cliente mesmo que `seo.siteUrl` ainda esteja vazio. `seo.openGraph.title` e `description` são opcionais caso a chamada social precise ser diferente do título e da descrição da página. Se usar uma imagem pronta com outro formato ou dimensões, ajuste `imageType`, `imageWidth` e `imageHeight`. O layout também emite o card grande do X. Depois de colocar o site em uma URL pública, confira a imagem no compartilhamento real; o preview local não pode ser acessado por redes sociais.

### Publicar na Vercel e configurar domínio na Cloudflare

O script `scripts/deploy.py` procura, por padrão, o arquivo **externo ao template** `Documents/tokens-para-criar-os-sites/credentials.env` na pasta pessoal de quem executa o comando. Ele lê apenas `VERCEL_TOKEN`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID` e, se existir, `VERCEL_TEAM_ID`. Outras chaves não são usadas. As credenciais não são copiadas para o projeto nem enviadas junto com o site. Em outro computador ou com outra organização de pastas, passe `--credentials` com o caminho do arquivo.

Cada cliente precisa de um nome de projeto Vercel próprio e de um domínio que pertença à zona Cloudflare acessível pela chave. Antes de publicar, personalize o conteúdo e a OG image. Rode primeiro a simulação, que gera e verifica o build **sem chamar as APIs**:

```bash
python scripts/deploy.py --project clinica-aurora --domain aurora.seudominio.com --dry-run
```

Quando estiver pronto para colocar esse cliente no ar:

```bash
python scripts/deploy.py --project clinica-aurora --domain aurora.seudominio.com
```

O comando gera novamente a OG image, executa `npm run check` e `npm run build`, cria ou reutiliza o projeto na Vercel, envia os arquivos estáticos, espera a implantação de produção ficar pronta, adiciona o domínio, realiza a verificação TXT quando exigida e cria o registro A ou CNAME recomendado pela Vercel na Cloudflare. O DNS fica em modo **somente DNS**, sem proxy. Repetir o comando com o mesmo projeto e domínio atualiza a implantação.

O script não altera registros A, AAAA ou CNAME que apontem para outro destino por padrão. Se você verificou que o domínio antigo deve ser substituído, execute com `--replace-dns`; essa opção remove os registros de site conflitantes no **mesmo nome** antes de criar o novo. Registros de e-mail como MX e TXT permanecem. Para uma zona Cloudflare diferente, use `--zone-id ID_DA_ZONA`; para uma equipe Vercel, use `--team-id ID_DA_EQUIPE` ou inclua `VERCEL_TEAM_ID` no arquivo de credenciais. O script recusa domínios fora da zona selecionada.

Depois do comando, DNS e certificado HTTPS podem levar alguns minutos para ficar prontos. Se a Vercel pedir uma verificação TXT que ainda não propagou, execute o mesmo comando novamente mais tarde. Nenhuma etapa de publicação acontece automaticamente ao rodar `npm run dev`, `check` ou `build`.

### Listas flexíveis

As arrays em `approach.items`, `services.items`, `space.highlights`, `about.paragraphs`, `professional.items`, `gallery.items`, `testimonials.items` e `faq.items` podem crescer ou diminuir. Os componentes geram os cards e itens automaticamente. Serviços aceitam `iconPaths` (caminhos SVG), `background` e `iconColor` por card. Um profissional pode ter várias linhas em `nameLines`.

Exemplo de serviço:

```ts
{
  title: "Implantes",
  description: "Avaliação e planejamento individual.",
  href: "#contato",
  linkLabel: "Conversar sobre implantes",
  iconPaths: ["M12 5v38", "M5 24h38"],
  background: "#edf9fd",
  iconColor: "#238acb",
}
```

Os links da coluna **Cuidados** no rodapé são gerados a partir de `services.items`. Os links do menu e da coluna **Explore** vêm de `navigation.links`.

### Ligar e desligar seções

Em `sections`, troque `true` por `false`, por exemplo `faq: false`. Os links de navegação com `section: "faq"` são filtrados automaticamente. CTAs que apontavam para uma seção oculta passam a levar a `#contato` (ou a `#inicio` se contato também estiver oculto). Revise o texto desses CTAs para que continue coerente com o novo destino.

Os IDs disponíveis são `#inicio`, `#servicos`, `#espaco`, `#sobre`, `#profissional`, `#galeria`, `#duvidas`, `#localizacao` e `#contato`. Links externos também podem ser usados nas ações. A hero inclui o header e deve continuar presente.

### Cores, fontes e layout

`theme` injeta as variáveis principais no elemento `<html>`. As cores detalhadas, espaçamentos e breakpoints estão em `public/styles.css`. A configuração padrão mantém o visual atual. Para uma identidade que exija mudanças mais profundas, ajuste o CSS sem precisar reescrever os componentes.

`theme.googleFontsUrl`, `displayFont` e `bodyFont` devem ser alterados juntos se a fonte mudar. O CSS usa `--display` para títulos e links e `--body` para parágrafos. Confira nomes longos, larguras de CTA e quebras de linha no mobile após trocar a fonte.

### Avaliações

Cada item de `testimonials.items` contém nome, nota, estrelas, foto, parágrafos e assinatura. `avatar.src` pode ser um retrato individual (`size: "cover"`, `position: "center"`) ou uma imagem com três retratos, como na configuração inicial (`size: "300% 100%"`). O carrossel e as setas funcionam com qualquer quantidade positiva de cards.

Os depoimentos presentes no exemplo são demonstrativos. Use relatos e fotos reais apenas com autorização.

### Galeria de fotos e prova social

`gallery.items` aceita quantas fotos forem necessárias. Cada item recebe `image` com `src`, `alt`, `width` e `height`, além de `caption` e `objectPosition` opcionais. `caption` é uma frase curta sobre a foto; `objectPosition` ajusta o enquadramento quando o cartão vertical recorta uma foto horizontal. Por exemplo:

```ts
{
  image: {
    src: "/assets/atendimento-cliente.webp",
    alt: "Equipe recebendo uma paciente na clínica",
    width: 1200,
    height: 1600,
  },
  caption: "Um cuidado próximo",
  objectPosition: "center 35%",
}
```

As fotos ocupam toda a largura da seção. `gallery.pixelsPerSecond` define a velocidade constante do movimento (padrão: `42`). O script duplica apenas os cartões necessários para completar a volta contínua, sem repetir o conteúdo para leitores de tela. O movimento pausa quando a galeria sai da tela, quando a aba fica oculta, no hover/foco e durante o arrasto. No mobile, é possível arrastar os cartões. Com a preferência do sistema por movimento reduzido, a animação é desligada e a galeria vira uma faixa rolável manualmente. Não há biblioteca adicional. Se `gallery.items` estiver vazio, a seção não é exibida; `sections.gallery: false` também a desliga.

As quatro fotos `gallery-*.webp` incluídas são **ilustrações geradas por IA**; as demais fotos da configuração também são material demonstrativo do template. Para apresentar prova social de um cliente, substitua tudo por fotos reais do consultório, da equipe e de pacientes que autorizaram esse uso. Atualize os textos alternativos para descrever as fotos reais e evite legendas que afirmem resultados não comprovados. Para carregamento rápido, prefira WebP ou AVIF em dimensões adequadas ao cartão; as dimensões declaradas na configuração devem corresponder aos arquivos finais.

### Localização

`location.mapQuery` é a busca enviada ao Google Maps, `mapZoom` controla a aproximação e `mapTitle` descreve o iframe para tecnologias assistivas. Troque a localização de exemplo pelo endereço do cliente e atualize `location.intro`. Se ainda não houver endereço autorizado, desative a seção em `sections.location`.

### Formulário e WhatsApp

O formulário inicial prepara uma mensagem para copiar: **nenhum dado é enviado pelo site**. `contact.fields` controla labels, placeholders e opções. `contact.messageTemplate` aceita `{name}`, `{email}`, `{phone}`, `{subject}`, `{message}` e `{phoneSuffix}`. O sufixo só aparece quando o usuário informa telefone.

Para oferecer um link de WhatsApp após a mensagem ser preparada:

```ts
delivery: {
  mode: "whatsapp",
  whatsappNumber: "5511999999999",
  whatsappLabel: "Abrir WhatsApp",
},
```

Use o número com DDI e DDD. O botão mostra a mensagem pronta e um link para abrir o WhatsApp; o envio final depende do usuário. Ajuste `contact.note` e `contact.intro` para descrever corretamente o canal escolhido. Para integrar outro destino ou backend, altere `public/scripts/contact.js` mantendo a validação nativa do formulário.

## Como o projeto está organizado

```text
src/config/site.ts               dados e opções de cada cliente
src/config/og-image.json          composição e saída da imagem OG
src/pages/index.astro            compõe as seções e aplica os toggles
src/layouts/BaseLayout.astro     HTML base, SEO, fontes, tema e scripts
src/components/Header.astro      marca, menu e botão superior
src/components/MenuPanel.astro   links do menu expansível
src/components/Footer.astro      CTA, links e nome grande
src/components/Cta.astro         botão/link com a seta padronizada
src/components/ServiceCard.astro card de serviço
src/components/ReviewCard.astro  card de avaliação
src/components/FaqItem.astro     pergunta expansível
src/components/sections/Gallery.astro  galeria de fotos
src/components/sections/        uma seção Astro por arquivo
public/styles.css               visual e breakpoints
public/scripts/                  comportamento do navegador
public/assets/                   fotos, imagens e bibliotecas GSAP
scripts/generate_og.py           gerador local da imagem OG
scripts/deploy.py                implantação Vercel + DNS Cloudflare
```

Os componentes recebem dados por props; os loops renderizam as listas. `Cta.astro` é compartilhado pelos CTAs de seções e footer. O JS em `public/scripts/` fica separado por comportamento: `ctas.js` monta o *text roll*, `menu.js` controla o menu, `faq.js` anima as respostas, `gallery.js` move a galeria contínua, `testimonials.js` move o carrossel, `contact.js` prepara a mensagem e `motion.js` cuida das animações GSAP.

O estado inicial dos textos animados é ocultado antes da renderização e revelado quando o GSAP está pronto, evitando FOUC sem remover seu espaço do layout. Há fallback para movimento reduzido ou carregamento incompleto. Ao acrescentar um novo texto animado, inclua seu seletor tanto na regra `html.split-pending` em `styles.css` quanto em `motion.js`.

## Antes de entregar uma versão

- Confirme nome, registro profissional quando aplicável, serviços, endereço e canais com o cliente.
- Substitua fotos e avaliações demonstrativas por material autorizado; ajuste os textos descritivos e o `alt` das imagens.
- Revise todos os destinos de CTA, especialmente após desativar seções.
- Execute `npm run check` e `npm run build`; navegue pelo menu, FAQ e formulário em desktop e mobile.
- Confira políticas, consentimento e integração de envio antes de coletar dados reais.
