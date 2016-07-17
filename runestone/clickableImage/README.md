<h4>Clickable Image</h4>
```html
<div data-component="clickableimage">
    <span data-question>Click on the correct sections of this image</span>
    <span data-feedback>Sorry, you are incorrect.</span>
    <img data-source src="image.jpg"/>
    <svg data-clickareas>
        <rect data-correct x="50" y="20" width="150" height="200">
        <circle data-incorrect cx="10" cy="200" r="50">
        <polygon data-incorrect points="200,10 250,190 160,210">
    </svg>
</div>
```


.. clickableimage:: clickimage1
    :feedback: Sorry, you are incorrect.
    :image: image.jpg
    :correct: ("rect", "50,20,150,200")
    :incorrect: ("circle", "10,200,50")
    :incorrect: ("polygon", "200,10|250,190|160,210")

    Click on the correct sections of this image.
