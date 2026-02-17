"""
U-Net architecture for stomach segmentation
"""
try:
    import torch
    import torch.nn as nn
    
    class DoubleConv(nn.Module):
        """Double convolution block"""
        def __init__(self, in_channels, out_channels):
            super().__init__()
            self.double_conv = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True),
                nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True)
            )
        
        def forward(self, x):
            return self.double_conv(x)
    
    
    class Down(nn.Module):
        """Downsampling block"""
        def __init__(self, in_channels, out_channels):
            super().__init__()
            self.maxpool_conv = nn.Sequential(
                nn.MaxPool2d(2),
                DoubleConv(in_channels, out_channels)
            )
        
        def forward(self, x):
            return self.maxpool_conv(x)
    
    
    class Up(nn.Module):
        """Upsampling block"""
        def __init__(self, in_channels, out_channels):
            super().__init__()
            self.up = nn.ConvTranspose2d(in_channels, in_channels // 2, kernel_size=2, stride=2)
            self.conv = DoubleConv(in_channels, out_channels)
        
        def forward(self, x1, x2):
            x1 = self.up(x1)
            
            # Handle size mismatch
            diff_y = x2.size()[2] - x1.size()[2]
            diff_x = x2.size()[3] - x1.size()[3]
            
            x1 = nn.functional.pad(x1, [diff_x // 2, diff_x - diff_x // 2,
                                        diff_y // 2, diff_y - diff_y // 2])
            
            x = torch.cat([x2, x1], dim=1)
            return self.conv(x)
    
    
    class UNet(nn.Module):
        """U-Net for medical image segmentation"""
        def __init__(self, in_channels=1, out_channels=1, features=[64, 128, 256, 512]):
            super().__init__()
            
            self.encoder = nn.ModuleList()
            self.decoder = nn.ModuleList()
            self.pool = nn.MaxPool2d(kernel_size=2, stride=2)
            
            # Encoder
            self.inc = DoubleConv(in_channels, features[0])
            
            for i in range(len(features) - 1):
                self.encoder.append(Down(features[i], features[i + 1]))
            
            # Bottleneck
            self.bottleneck = DoubleConv(features[-1], features[-1] * 2)
            
            # Decoder
            for i in range(len(features) - 1, -1, -1):
                in_f = features[i] * 2 if i == len(features) - 1 else features[i + 1]
                self.decoder.append(Up(in_f + features[i], features[i]))
            
            # Output
            self.outc = nn.Conv2d(features[0], out_channels, kernel_size=1)
        
        def forward(self, x):
            skip_connections = []
            
            # Initial convolution
            x = self.inc(x)
            skip_connections.append(x)
            
            # Encoder path
            for down in self.encoder:
                x = down(x)
                skip_connections.append(x)
            
            # Bottleneck
            x = self.pool(x)
            x = self.bottleneck(x)
            
            # Decoder path
            skip_connections = skip_connections[::-1]
            for i, up in enumerate(self.decoder):
                x = up(x, skip_connections[i])
            
            return self.outc(x)

except ImportError:
    # Fallback if torch not available
    class UNet:
        def __init__(self, *args, **kwargs):
            pass
        
        def __call__(self, x):
            return x
