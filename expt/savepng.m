
for i = 1:20
    for c = 1:5
        [img,map] = imread(sprintf('images/FaceStim/img%i_contrast%i.jpg',i,c));
        g = gray(256);
        m = ind2rgb(img, g);
        a = all(m<=.94, 3);
        imwrite(m, sprintf('images/FaceStim/img%i_contrast%i.png',i,c),'Alpha', double(a));
    end
end
